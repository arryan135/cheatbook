import * as esbuild from 'esbuild-wasm';
import axios from "axios";
 
export const unpkgPathPlugin = () => {
  return {
    name: 'unpkg-path-plugin',
    setup(build: esbuild.PluginBuild) {
      // is called when ESbuild is trying to figure out a path to a particular module
      // with onResolve we have the ability to override where esbuild trys to find that file  
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        console.log('onResolve', args);
        if (args.path === "index.js"){
          return { path: args.path, namespace: 'a' };
        } 

        // whether or not we are working with a file that has a relative path in it
        if (args.path.includes("./") || args.path.includes("../")){
          return {
            namespace: "a",
            path: new URL(args.path, `https://unpkg.com${args.resolveDir}/`).href
          }
        }

        // if we have a path other than index.js
        return {
          namespace: "a",
          path: `https://unpkg.com/${args.path}`                         
        }
      });

      // onLoad file is used to load up a file from the file system
      // if we define an onLoad function in our plugin, we override ESbuild's natural process of trying to access the filesystem
      build.onLoad({ filter: /.*/ }, async (args: any) => {
        console.log('onLoad', args);
 
        // if esbuild is attempting to load the index.js file dont let it do its normal thing
        // dont let it load a file from the file system. We loaded it for you using the return object
        if (args.path === 'index.js') {
          return {
            loader: 'jsx',
            // in the contents it tries to find any require/imports and after finding any it runs the 
            contents: `
              import React, {useState} from "react"
              console.log(React);
            `,
          };
        } 

        const { data, request } = await axios.get(args.path);
        console.log(request);
        return {
          loader: "jsx",
          contents: data,
          resolveDir: new URL("./", request.responseURL).pathname
        }
      });
    },
  };
};