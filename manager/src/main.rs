use std::sync::Mutex;
use std::{env::var, sync::atomic::AtomicBool};
use std::{error::Error, sync::atomic::Ordering};
use std::{
    fs,
    io::{Read, Write},
    path::Path,
};

use linear_map::LinearMap;
use serde_yaml::{Mapping, Value};
use tmpl::TemplatingReader;

lazy_static::lazy_static! {
    static ref REQUIRES_REINDEX: AtomicBool = AtomicBool::new({
        Path::new("/root/.bitcoin/requires.reindex").exists()
    });
    static ref CHILD_PID: Mutex<Option<u32>> = Mutex::new(None);
}

pub enum Level {
    Error,
    Warn,
    Success,
    Info,
}
impl std::fmt::Display for Level {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Level::Error => write!(f, "ERROR"),
            Level::Warn => write!(f, "WARN"),
            Level::Success => write!(f, "SUCCESS"),
            Level::Info => write!(f, "INFO"),
        }
    }
}

pub struct Notification {
    time: f64,
    level: Level,
    code: usize,
    title: String,
    message: String,
}

fn write_to_replacing<W: Write>(s: &str, rmc: char, add: &str, w: &mut W) -> std::io::Result<()> {
    let mut buf = [0; 4];
    for c in s.chars() {
        if c != rmc {
            let s = c.encode_utf8(&mut buf);
            w.write_all(s.as_bytes())?;
        } else {
            w.write_all(add.as_bytes())?;
        }
    }
    Ok(())
}

#[derive(Clone, Debug, serde::Deserialize)]
pub struct ChainInfo {
    blocks: usize,
    headers: usize,
    verificationprogress: f64,
    size_on_disk: u64,
    #[serde(default)]
    pruneheight: usize,
}

#[derive(Clone, Debug, serde::Serialize)]
pub struct Stats {
    version: u8,
    data: LinearMap<&'static str, Stat>,
}

#[derive(Clone, Debug, serde::Serialize)]
pub struct Stat {
    #[serde(rename = "type")]
    value_type: &'static str,
    value: String,
    description: Option<&'static str>,
    copyable: bool,
    qr: bool,
    masked: bool,
}

fn sidecar(config: &Mapping, addr: &str) -> Result<(), Box<dyn Error>> {
    let mut stats = LinearMap::new();
    if let (Some(user), Some(pass)) = (
        config
            .get(&Value::String("rpc".to_owned()))
            .and_then(|v| v.get(&Value::String("username".to_owned())))
            .and_then(|v| v.as_str()),
        config
            .get(&Value::String("rpc".to_owned()))
            .and_then(|v| v.get(&Value::String("password".to_owned())))
            .and_then(|v| v.as_str()),
    ) {
        stats.insert(
            "Tor Quick Connect",
            Stat {
                value_type: "string",
                value: format!("btcstandup://{}:{}@{}:8332", user, pass, addr),
                description: Some("Bitcoin-Standup Tor Quick Connect URL"),
                copyable: true,
                qr: true,
                masked: true,
            },
        );
        let addr_local = format!("{}local", addr.strip_suffix("onion").unwrap());
        stats.insert(
            "LAN Quick Connect",
            Stat {
                value_type: "string",
                value: format!("btcstandup://{}:{}@{}:8332", user, pass, addr_local),
                description: Some("Bitcoin-Standup LAN Quick Connect URL"),
                copyable: true,
                qr: true,
                masked: true,
            },
        );
        stats.insert(
            "RPC Username",
            Stat {
                value_type: "string",
                value: format!("{}", user),
                description: Some("Bitcoin RPC Username"),
                copyable: true,
                masked: false,
                qr: false,
            },
        );
        stats.insert(
            "RPC Password",
            Stat {
                value_type: "string",
                value: format!("{}", pass),
                description: Some("Bitcoin RPC Password"),
                copyable: true,
                masked: true,
                qr: false,
            },
        );
    }
    let info_res = std::process::Command::new("bitcoin-cli")
        .arg("-conf=/root/.bitcoin/bitcoin.conf")
        .arg("getblockchaininfo")
        .output()?;
    if info_res.status.success() {
        let info: ChainInfo = serde_json::from_slice(&info_res.stdout)?;
        stats.insert(
            "Block Height",
            Stat {
                value_type: "string",
                value: format!("{}", info.headers),
                description: Some("The current block height for the network"),
                copyable: false,
                qr: false,
                masked: false,
            },
        );
        stats.insert(
            "Synced Block Height",
            Stat {
                value_type: "string",
                value: format!("{}", info.blocks),
                description: Some("The number of blocks the node has verified"),
                copyable: false,
                qr: false,
                masked: false,
            },
        );
        stats.insert(
            "Sync Progress",
            Stat {
                value_type: "string",
                value: if info.blocks < info.headers {
                    format!("{:.2}%", 100.0 * info.verificationprogress)
                } else {
                    "100%".to_owned()
                },
                description: Some("The percentage of the blockchain that has been verified"),
                copyable: false,
                qr: false,
                masked: false,
            },
        );
        stats.insert(
            "Disk Usage",
            Stat {
                value_type: "string",
                value: format!("{:.2} GiB", info.size_on_disk as f64 / 1024_f64.powf(3_f64)),
                description: Some("The blockchain size on disk"),
                copyable: false,
                qr: false,
                masked: false,
            },
        );
        if info.size_on_disk as f64
            > (|| -> Option<f64> {
                let advanced = config.get(&Value::String("advanced".to_owned()))?;
                let pruning = advanced.get(&Value::String("pruning".to_owned()))?;
                if pruning.get(&Value::String("mode".to_owned()))? == "manual" {
                    let size = pruning.get(&Value::String("size".to_owned()))?;
                    Some(size.as_f64()? * 1024_f64.powf(2_f64))
                } else {
                    None
                }
            })()
            .unwrap_or(std::f64::INFINITY)
        {
            std::process::Command::new("bitcoin-cli")
                .arg("-conf=/root/.bitcoin/bitcoin.conf")
                .arg("pruneblockchain")
                .arg(format!("{}", info.pruneheight + 10))
                .status()?;
        }
        if info.pruneheight > 0 {
            stats.insert(
                "Prune Height",
                Stat {
                    value_type: "string",
                    value: format!("{}", info.pruneheight),
                    description: Some("The number of blocks that have been deleted from disk"),
                    copyable: false,
                    qr: false,
                    masked: false,
                },
            );
        }
        if REQUIRES_REINDEX.load(Ordering::SeqCst) {
            if match fs::remove_file("/root/.bitcoin/requires.reindex") {
                Ok(()) => true,
                Err(_) => false,
            } {
                REQUIRES_REINDEX.store(false, Ordering::SeqCst);
            }
        }
    } else {
        eprintln!(
            "Error updating blockchain info: {}",
            std::str::from_utf8(&info_res.stderr).unwrap_or("UNKNOWN ERROR")
        )
    }
    serde_yaml::to_writer(
        std::fs::File::create("/root/.bitcoin/start9/.stats.yaml.tmp")?,
        &Stats {
            version: 2,
            data: stats,
        },
    )?;
    std::fs::rename(
        "/root/.bitcoin/start9/.stats.yaml.tmp",
        "/root/.bitcoin/start9/stats.yaml",
    )?;
    Ok(())
}

fn publish_notification(e: &Notification) -> std::io::Result<()> {
    let mut f = std::fs::OpenOptions::new()
        .write(true)
        .create(true)
        .append(true)
        .open("/root/.bitcoin/start9/notifications.log")?;
    f.write_all(format!("{}:{}:{}:", e.time, e.level, e.code).as_bytes())?;
    write_to_replacing(&e.title, ':', "\u{A789}", &mut f)?;
    f.write_all(b":")?;
    write_to_replacing(&e.message, '\n', "\u{2026}", &mut f)?;
    f.write_all(b"\n")?;
    f.flush()
}

fn notification_handler(line: &str) -> std::io::Result<()> {
    if line.contains("Prune: last wallet synchronisation goes beyond pruned data.")
        || line.contains("Please restart with -reindex or -reindex-chainstate to recover.")
    {
        publish_notification(&Notification {
            time: std::time::UNIX_EPOCH
                .elapsed()
                .map(|t| t.as_secs_f64())
                .unwrap_or(0_f64),
            level: Level::Error,
            code: 0,
            title: "General Error".to_owned(),
            message: format!(
                "{}\nBitcoin Core will now be restarted with -reindex.",
                line
            ),
        })?;
        REQUIRES_REINDEX.store(true, Ordering::SeqCst);
    } else if line.starts_with("Error:") {
        publish_notification(&Notification {
            time: std::time::UNIX_EPOCH
                .elapsed()
                .map(|t| t.as_secs_f64())
                .unwrap_or(0_f64),
            level: Level::Error,
            code: 0,
            title: "General Error".to_owned(),
            message: line[6..].trim().to_owned(),
        })?;
    }
    Ok(())
}

pub struct StdOutReader<R: Read> {
    inner: R,
}
impl<R: Read> StdOutReader<R> {
    pub fn new(rdr: R) -> Self {
        StdOutReader { inner: rdr }
    }
}
impl<R> Read for StdOutReader<R>
where
    R: Read,
{
    fn read(&mut self, buf: &mut [u8]) -> std::io::Result<usize> {
        self.inner.read(buf)
    }
}
pub struct StdErrReader<R: Read> {
    inner: R,
    line: Vec<u8>,
}
impl<R: Read> StdErrReader<R> {
    pub fn new(rdr: R) -> Self {
        StdErrReader {
            inner: rdr,
            line: Vec::new(),
        }
    }
}
impl<R> Read for StdErrReader<R>
where
    R: Read,
{
    fn read(&mut self, buf: &mut [u8]) -> std::io::Result<usize> {
        let res = self.inner.read(buf)?;
        if let Some(idx) = buf[..res].iter().position(|a| a == &b'\n').or_else(|| {
            if res == 0 {
                Some(0)
            } else {
                None
            }
        }) {
            self.line.extend_from_slice(&buf[..idx]);
            notification_handler(
                std::str::from_utf8(&self.line)
                    .map_err(|e| std::io::Error::new(std::io::ErrorKind::InvalidData, e))?,
            )?;
            self.line.clear();
            if idx + 1 <= res {
                self.line.extend_from_slice(&buf[(idx + 1)..res]);
            }
        }
        Ok(res)
    }
}

fn inner_main(reindex: bool) -> Result<(), Box<dyn Error>> {
    let config: Mapping =
        serde_yaml::from_reader(std::fs::File::open("/root/.bitcoin/start9/config.yaml")?)?;
    let sidecar_poll_interval = std::time::Duration::from_secs(5);
    let addr = var("TOR_ADDRESS")?;
    let mut btc_args = vec![
        format!("-onion={}:9050", var("HOST_IP")?),
        format!("-externalip={}", addr),
        "-datadir=/root/.bitcoin".to_owned(),
        "-conf=/root/.bitcoin/bitcoin.conf".to_owned(),
    ];
    if config
        .get(&Value::String("advanced".to_owned()))
        .and_then(|v| v.as_mapping())
        .and_then(|v| v.get(&Value::String("peers".to_owned())))
        .and_then(|v| v.as_mapping())
        .and_then(|v| v.get(&Value::String("onlyonion".to_owned())))
        .and_then(|v| v.as_bool())
        .unwrap_or(false)
    {
        btc_args.push(format!("-proxy={}:9050", var("HOST_IP")?));
    }
    {
        // disable chain data backup
        let mut f = std::fs::File::create("/root/.bitcoin/.backupignore")?;
        writeln!(f, "blocks/")?;
        writeln!(f, "chainstate/")?;
        f.flush()?;
    }
    if reindex {
        btc_args.push("-reindex".to_owned());
    }

    std::io::copy(
        &mut TemplatingReader::new(
            std::fs::File::open("/root/.bitcoin/bitcoin.conf.template")?,
            &config,
            &"{{var}}".parse()?,
            b'%',
        ),
        &mut std::fs::File::create("/root/.bitcoin/bitcoin.conf")?,
    )?;
    let mut child = std::process::Command::new("bitcoind")
        .args(btc_args)
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .spawn()?;
    let raw_child = child.id();
    *CHILD_PID.lock().unwrap() = Some(raw_child);
    let child_stdout = child.stdout.take();
    let _stdout_handle = std::thread::spawn(move || {
        if let Some(stdout) = child_stdout {
            let mut r = StdOutReader::new(stdout);
            let mut w = std::io::stdout();
            loop {
                std::io::copy(&mut r, &mut w)
                    .err()
                    .map(|e| eprintln!("ERROR IN LOG PARSER: {}", e));
            }
        }
    });
    let child_stderr = child.stderr.take();
    let _stderr_handle = std::thread::spawn(move || {
        if let Some(stderr) = child_stderr {
            let mut r = StdErrReader::new(stderr);
            let mut w = std::io::stderr();
            loop {
                std::io::copy(&mut r, &mut w)
                    .err()
                    .map(|e| eprintln!("ERROR IN LOG PARSER: {}", e));
            }
        }
    });
    let _sidecar_handle = std::thread::spawn(move || loop {
        sidecar(&config, &addr)
            .err()
            .map(|e| eprintln!("ERROR IN SIDECAR: {}", e));
        std::thread::sleep(sidecar_poll_interval);
    });
    let code = child.wait()?.code().unwrap_or(0);
    if code != 0 {
        publish_notification(&Notification {
            time: std::time::UNIX_EPOCH
                .elapsed()
                .map(|t| t.as_secs_f64())
                .unwrap_or(0_f64),
            level: Level::Error,
            code: code as usize,
            title: "Fatal Error".to_owned(),
            message: format!("Bitcoin Core has crashed with exit code: {}", code),
        })?;
    }
    if REQUIRES_REINDEX.load(Ordering::SeqCst) {
        inner_main(true) // restart
    } else {
        std::process::exit(code)
    }
}

fn main() -> Result<(), Box<dyn Error>> {
    ctrlc::set_handler(move || {
        if let Some(raw_child) = *CHILD_PID.lock().unwrap() {
            use nix::{
                sys::signal::{kill, SIGTERM},
                unistd::Pid,
            };
            kill(Pid::from_raw(raw_child as i32), SIGTERM).unwrap();
        }
    })?;
    inner_main(REQUIRES_REINDEX.load(Ordering::SeqCst))
}
