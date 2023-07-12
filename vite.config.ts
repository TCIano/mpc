import vue from '@vitejs/plugin-vue'
import viteSvgIcons from 'vite-plugin-svg-icons'
import Components from 'unplugin-vue-components/vite'
import OptimizationPersist from 'vite-plugin-optimize-persist'
import PkgConfig from 'vite-plugin-package-config'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import path from 'path'
import { ConfigEnv, defineConfig } from 'vite'
import dotenv from 'dotenv'
import vueSetupExtend from 'vite-plugin-vue-setup-extend'
import topLevelAwait from 'vite-plugin-top-level-await'
export default ({ mode }) => {
  const dotenvConfig = dotenv.config({ path: `./.env.${mode}` })
  const dotenvObj = dotenvConfig.parsed
  return defineConfig({
    base: dotenvObj?.BUILD_PATH,
    build: {
      outDir: dotenvObj?.BUILD_OUT_DIR || 'dist',
    },
    plugins: [
      vue(),
      Components({
        resolvers: [AntDesignVueResolver()],
      }),
      viteSvgIcons({
        iconDirs: [path.resolve(process.cwd(), 'src/icons')],
        symbolId: 'icon-[dir]-[name]',
      } as any),
      PkgConfig(),
      OptimizationPersist(),
      vueSetupExtend(),
      //顶部使用await
      topLevelAwait({
        promiseExportName: '__tla',
        promiseImportName: (i) => `__tla_${i}`,
      }),
    ] as any,
    css: {
      preprocessorOptions: {
        less: {
          additionalData: `@import "src/styles/variables.less";`,
          modifyVars: {},
          javascriptEnabled: true,
        },
      },
      postcss: {
        plugins: [require('tailwindcss'), require('autoprefixer')],
      },
    },
    resolve: {
      alias: [
        {
          find: '@/',
          replacement: path.resolve(process.cwd(), 'src') + '/',
        },
      ],
    },
    server: {
      open: true,
      proxy: {
        '/api/pltf': {
          target: 'http://192.168.0.49:62101',
          changeOrigin: true,
        },
        '/api/pms': {
          target: 'http://192.168.0.49:62102',
          changeOrigin: true,
        },
        // '/api/MPC': {
        //   target: 'http://192.168.0.210:62103',
        //   changeOrigin: true,
        // },
        // '/api/DPC/Watch': {
        //   target: 'http://192.168.0.49:64585',
        //   changeOrigin: true,
        // },
        '/api/DPC': {
          target: 'http://192.168.0.49:62103',
          changeOrigin: true,
        },
        '/api/IPY': {
          target: 'http://192.168.0.49:62105',
          changeOrigin: true,
        },
      },
    },
    optimizeDeps: {
      include: [],
      exclude: ['vue-demi'],
    },
  })
}
