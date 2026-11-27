(function installAssetFetch(assets) {
  const absolute = path => new URL(path, document.baseURI).href;
  const splitAssets = new Map(assets.map(asset => [absolute(asset.path), asset]));
  const fetchFile = window.fetch.bind(window);

  // Unity still requests the hashed build filename. Supply its original bytes as a stream.
  window.fetch = async (input, options) => {
    const request = input instanceof Request ? input : null;
    const asset = splitAssets.get(absolute(request?.url ?? input));
    if (!asset) return fetchFile(input, options);

    const headers = {
      "Content-Type": "application/octet-stream",
      "Content-Length": String(asset.size),
    };
    const method = options?.method ?? request?.method ?? "GET";
    if (method === "HEAD") return new Response(null, { headers });
    if (method !== "GET") return fetchFile(input, options);

    const signal = options?.signal ?? request?.signal;
    let part = 0;
    let reader;
    const content = new ReadableStream({
      async pull(controller) {
        while (part < asset.parts.length || reader) {
          if (!reader) {
            const response = await fetchFile(absolute(asset.parts[part]), { signal });
            if (!response.ok || !response.body) {
              throw new Error(`Could not load game asset ${asset.parts[part]} (HTTP ${response.status}).`);
            }
            reader = response.body.getReader();
            part += 1;
          }
          const { done, value } = await reader.read();
          if (!done) {
            controller.enqueue(value);
            return;
          }
          reader.releaseLock();
          reader = undefined;
        }
        controller.close();
      },
      cancel(reason) {
        return reader?.cancel(reason);
      },
    });
    return new Response(content, { headers });
  };
})([{"path":"Build/cb39477d8cdf5cf524dd1fb9eb23baae.data.unityweb","size":310934654,"parts":["Build/cb39477d8cdf5cf524dd1fb9eb23baae.data.unityweb.part-1","Build/cb39477d8cdf5cf524dd1fb9eb23baae.data.unityweb.part-2","Build/cb39477d8cdf5cf524dd1fb9eb23baae.data.unityweb.part-3","Build/cb39477d8cdf5cf524dd1fb9eb23baae.data.unityweb.part-4","Build/cb39477d8cdf5cf524dd1fb9eb23baae.data.unityweb.part-5","Build/cb39477d8cdf5cf524dd1fb9eb23baae.data.unityweb.part-6","Build/cb39477d8cdf5cf524dd1fb9eb23baae.data.unityweb.part-7"]}]);
