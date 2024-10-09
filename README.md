# warpx-frontend

## SDK

```
cd packages/sdk
```

```bash
./target/release/warpx-node \
--rpc-port 9945 \
...
```

```bash
curl -H "Content-Type: application/json" \
     -d '{"id":"1", "jsonrpc":"2.0", "method": "state_getMetadata", "params":[]}' \
     http://localhost:9945 > ./warpx.json
```

```bash
yarn codegen

# or

yarn workspace @warpx/sdk codegen
```
