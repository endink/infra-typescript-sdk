const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const htmlWebpackPlugin = new HtmlWebpackPlugin({
    title: "infra test"
});

module.exports = {
    target:"web",
    entry: path.join(__dirname, "src/minio/index.ts"),
    output: {
        path: path.join(__dirname, "example/dist"),
        filename: "bundle.js",
        library: "test"
    },
    module: {
        rules: [
            {
                test: /\.tsx?/,
                loader: "ts-loader",
            },
            {
                // pre/nomal/post - loader的执行顺序 - 前/中/后
                enforce: "pre",
                test: /\.tsx?/,
                loader: "source-map-loader",
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.(png|jpg|gif|mp4)$/,
                use: {
                    loader: "url-loader",
                    options: {
                        limit: 100 * 1024,
                    },
                },
            },
        ],
    },
    //映射工具
    devtool: 'source-map',
    //处理路径解析
    resolve: {
        //extensions 拓展名
        extensions: [".tsx", ".ts", ".js", ".jsx", ".json"],
    },
    // plugins: [htmlWebpackPlugin],
    devServer: {
        port: 3005,
    },
}
