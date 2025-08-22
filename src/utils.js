const DEFAULT_IPFS_GATEWAY = "https://ipfs.io/ipfs/";

function isEmpty(value) {
    return value === undefined || value === null || String(value).trim() === "";
}

function extractCidAndPath(input) {
    try {
        if (isEmpty(input)) return null;
        const urlStr = String(input).trim();

        // Cases:
        // 1) ipfs://<cid>/<path>
        if (urlStr.startsWith("ipfs://")) {
            const rest = urlStr.slice("ipfs://".length);
            return rest; // already in form <cid>/<path?>
        }

        // 2) https://gateway.pinata.cloud/ipfs/<cid>/<path?> or https://ipfs.io/ipfs/<cid>/<path?>
        // 3) any */ipfs/<cid>/<path?>
        const ipfsMarker = "/ipfs/";
        const idx = urlStr.indexOf(ipfsMarker);
        if (idx !== -1) {
            return urlStr.slice(idx + ipfsMarker.length);
        }

        // 4) raw CID (no prefix)
        // naive check: CID-like strings are long and base58/base32; we just fallback to treat whole as CID
        return urlStr;
    } catch (_) {
        return null;
    }
}

export const GetIpfsUrlFromPinata = (inputUrl, gatewayBase = DEFAULT_IPFS_GATEWAY) => {
    const cidAndPath = extractCidAndPath(inputUrl);
    if (isEmpty(cidAndPath)) return "";
    const base = gatewayBase.endsWith("/") ? gatewayBase : gatewayBase + "/";
    // Ensure no leading slash in cidAndPath
    const normalized = String(cidAndPath).replace(/^\/+/, "");
    return base + normalized;
};

export const safeAxiosGet = async (axiosInstance, url) => {
    if (isEmpty(url)) return null;
    try {
        const res = await axiosInstance.get(url);
        return res;
    } catch (_) {
        return null;
    }
};