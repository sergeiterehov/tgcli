import { config } from "dotenv";

config();

import ssh2 from "ssh2";
import { readFileSync } from "fs";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";

const server = new ssh2.Server(
  {
    hostKeys: [readFileSync(String(process.env["SSH_KEY"]))],
  },
  (client) => {
    console.log("Client connected!");

    let info: ssh2.PseudoTtyInfo = {} as any;
    let proc: ChildProcessWithoutNullStreams;

    client
      .on("authentication", (ctx) => {
        ctx.accept();
      })
      .on("ready", () => {
        console.log("Client authenticated!");

        let stream: ssh2.ServerChannel;

        client.on("session", (accept, reject) => {
          const session = accept();

          session.on("pty", (accept, reject, newInfo) => {
            accept();

            Object.assign(info, newInfo);
          });

          session.on("window-change", (accept, reject, newInfo) => {
            Object.assign(info, newInfo);

            (stream as any).columns = info.cols;
            (stream as any).rows = info.rows;

            stream.emit("resize");
          });

          session.on("shell", (accept) => {
            stream = accept();

            (stream as any).columns = info.cols;
            (stream as any).rows = info.rows;
            (stream as any).isTTY = true;

            proc = spawn("node dist/index.js", { shell: true });

            stream.pipe(proc.stdin);
            proc.stdout.pipe(stream);
            proc.stderr.pipe(stream);

            setTimeout(() => {
              stream.exit(0);
              stream.end();
            }, 2000);
          });
        });
      })
      .on("close", () => {
        console.log("Client disconnected");

        if (!proc.killed) proc.kill(9);
      });
  }
);

server.listen(8022, "127.0.0.1", () => {
  console.log("Listening: " + JSON.stringify(server.address()));
});
