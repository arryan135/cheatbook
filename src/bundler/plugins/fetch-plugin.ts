import * as esbuild from "esbuild-wasm";
import axios from "axios";
import localforage from "localforage";

const fileCache = localforage.createInstance({
  name: "filecache"
});

// onLoad file is used to load up a file from the file system
// if we define an onLoad function in our plugin, we override ESbuild's natural process of trying to access the filesystem
export const fetchPlugin = (inputCode: string) => {
  return {
    name: "fetch-plugin",
    setup(build: esbuild.PluginBuild) {
      // if esbuild is attempting to load the index.js file dont let it do its normal thing
      // dont let it load a file from the file system. We loaded it for you using the return object
      build.onLoad( {filter: /(^index\.js$)/}, () => {
        return {
          loader: 'jsx',
          // in the contents it tries to find any require/imports and after finding any it runs the 
          contents: inputCode,
        };
      });

      // if cached, then return. Otherwise, continue on with other onLoad()s
      build.onLoad( { filter: /.*/ }, async (args: any) => {
        const cachedResult = await fileCache.getItem<esbuild.OnLoadResult>(args.path);
        if (cachedResult){
          return cachedResult;
        }
      });

      build.onLoad({ filter: /.css$/}, async (args: any) => {
        const { data, request } = await axios.get(args.path);
        // remove quotations from the css file to enabled valid js
        const escaped = data
          .replace(/\n/g, "")   // newlines removed
          .replace(/"/g, '\\"') // double quotes escaped
          .replace(/'/g, "\\'") // single quotes escaped
        const contents = `
            const style = document.createElement("style");
            style.innerText = '${escaped}';
            document.head.appendChild(style);
          `;

        const result: esbuild.OnLoadResult =  {
          loader : "jsx",
          contents,
          resolveDir: new URL("./", request.responseURL).pathname
        }

        // store in cache if not already in cache
        await fileCache.setItem(args.path, result);
        return result;
      });


      build.onLoad({ filter: /.*/ }, async (args: any) => {
        const { data, request } = await axios.get(args.path);
        const result: esbuild.OnLoadResult =  {
          loader : "jsx",
          contents: data,
          resolveDir: new URL("./", request.responseURL).pathname
        }

        // store in cache if not already in cache
        await fileCache.setItem(args.path, result);
        return result;
      });
    }
  }
}