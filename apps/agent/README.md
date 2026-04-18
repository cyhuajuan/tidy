# agent

这是一个基于 Mastra 的只读文件管理 agent。当前版本只支持读取目录内容，不支持创建、删除、移动、重命名或写入文件。

## 本地运行

在 `apps/agent` 目录启动开发服务器：

```shell
pnpm run dev
```

启动后可以打开 [http://localhost:4111](http://localhost:4111) 进入 Mastra Studio，调试 `fileManagerAgent` 并查看工具调用。

## 示例提示词

可以直接在 Studio 中测试下面这类请求：

```text
列出 C:\Users\27485\WorkSpace 目录下的内容
```

```text
读取当前工作目录下 logs 文件夹的内容
```

如果没有提供路径，agent 会要求用户先补充目录路径。
