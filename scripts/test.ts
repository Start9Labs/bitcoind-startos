import { ValueSpecAny } from "./types.d.ts";


const auth: ValueSpecAny = {
  "name": "Authorization",
  "description": "Username and hashed password for JSON-RPC connections. RPC clients connect using the usual http basic authentication.",
  "type": "list",
  "subtype": "string",
  "default": [],
  "spec": {
    "pattern": "^[a-zA-Z0-9_-]+:([0-9a-fA-F]{2})+\\$([0-9a-fA-F]{2})+$",
    "pattern-description": "Each item must be of the form \"<USERNAME>:<SALT>$<HASH>\"."
  },
  "range": "[0,*)"
}

const addNode: ValueSpecAny = {
  "name": "Add Nodes",
  "description": "Add addresses of nodes to connect to.",
  "type": "list",
  "subtype": "object",
  "range": "[0,*)",
  "default": [],
  "spec": {
    "type": "object",
    "nullable": false,
    "name": "Peer",
    "description": "Peer to connect to",
    "spec": {
      "hostname": {
        "type": "string",
        "nullable": false,
        "name": "Hostname",
        "description": "Domain or IP address of bitcoin peer",
        "pattern": "(^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$)|((^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$)|(^[a-z2-7]{16}\\.onion$)|(^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$))",
        "pattern-description": "Must be either a domain name, or an IPv4 or IPv6 address. Do not include protocol scheme (eg 'http://') or port."
      },
      "port": {
        "type": "number",
        "nullable": true,
        "name": "Port",
        "description": "Port that peer is listening on for inbound p2p connections",
        "range": "[0,65535]",
        "integral": true
      }
    }
  }
}