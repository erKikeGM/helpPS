#!/usr/bin/env node
"use strict";

const fs = require("fs");
const http = require("http");
const net = require("net");
const os = require("os");
const path = require("path");
const readline = require("readline");
const { spawn, spawnSync } = require("child_process");

const projectName = "helpps";
const defaultPort = 5173;
let action = "start";
let appPort = "";
let openBrowser = true;

function banner() {
  console.log("+--------------------------------------+");
  console.log("|  HELPPS ONE-CLICK RUNNER             |");
  console.log("|  Safety Mind support platform        |");
  console.log("+--------------------------------------+");
}

function usage() {
  banner();
  console.log("");
  console.log("Usage:");
  console.log("  HelpPSRunner.exe                 Start HelpPS");
  console.log("  HelpPSRunner.exe --port 3002     Start on a custom port");
  console.log("  HelpPSRunner.exe --no-open       Start without opening a browser");
  console.log("  HelpPSRunner.exe --logs          Show container logs");
  console.log("  HelpPSRunner.exe --stop          Stop HelpPS");
  console.log("  HelpPSRunner.exe --help          Show this help");
  console.log("");
  console.log(`Default URL: http://localhost:${defaultPort}`);
  console.log("");
  console.log("Prerequisite: Docker Desktop must be installed and running.");
}

function parseArgs(argv) {
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      action = "help";
    } else if (arg === "--stop") {
      action = "stop";
    } else if (arg === "--logs") {
      action = "logs";
    } else if (arg === "--no-open") {
      openBrowser = false;
    } else if (arg === "--port") {
      const value = argv[i + 1];
      if (!value) throw new Error("--port requires a number.");
      appPort = value;
      i += 1;
    } else if (arg.startsWith("--port=")) {
      appPort = arg.slice("--port=".length);
    } else {
      throw new Error(`Unknown option: ${arg}. Use --help.`);
    }
  }
}

function findProjectRoot() {
  const candidates = [
    process.cwd(),
    path.dirname(process.execPath),
    path.resolve(__dirname, "../.."),
    path.resolve(path.dirname(process.execPath), ".."),
  ];

  for (const candidate of candidates) {
    if (
      fs.existsSync(path.join(candidate, "docker-compose.yml")) &&
      fs.existsSync(path.join(candidate, "package.json"))
    ) {
      return candidate;
    }
  }

  throw new Error("Could not find the HelpPS project folder. Keep the runner next to docker-compose.yml.");
}

function runResult(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: options.cwd,
    env: options.env || process.env,
    encoding: "utf8",
    stdio: options.stdio || "pipe",
    shell: false,
  });
}

function requireDocker(projectRoot) {
  const dockerVersion = runResult("docker", ["--version"], { cwd: projectRoot });
  if (dockerVersion.error || dockerVersion.status !== 0) {
    throw new Error("Docker is not installed. Install Docker Desktop, then run this again.");
  }

  const dockerInfo = runResult("docker", ["info"], { cwd: projectRoot });
  if (dockerInfo.error || dockerInfo.status !== 0) {
    throw new Error("Docker is installed but not running. Start Docker Desktop, then run this again.");
  }

  const composePlugin = runResult("docker", ["compose", "version"], { cwd: projectRoot });
  if (!composePlugin.error && composePlugin.status === 0) {
    return { command: "docker", baseArgs: ["compose"] };
  }

  const legacyCompose = runResult("docker-compose", ["version"], { cwd: projectRoot });
  if (!legacyCompose.error && legacyCompose.status === 0) {
    return { command: "docker-compose", baseArgs: [] };
  }

  throw new Error("Docker Compose is not available. Update Docker Desktop or install docker-compose.");
}

function composeArgs(compose, projectRoot, args) {
  return [
    ...compose.baseArgs,
    "-f",
    path.join(projectRoot, "docker-compose.yml"),
    "-p",
    projectName,
    ...args,
  ];
}

function runCompose(compose, projectRoot, args, options = {}) {
  return spawnSync(compose.command, composeArgs(compose, projectRoot, args), {
    cwd: projectRoot,
    env: options.env || process.env,
    stdio: options.stdio || "inherit",
    shell: false,
  });
}

function validatePort(port) {
  if (!/^[0-9]+$/.test(String(port))) throw new Error("Port must be a number.");
  const number = Number(port);
  if (number < 1024 || number > 65535) {
    throw new Error("Port must be between 1024 and 65535.");
  }
  return number;
}

function isPortBusy(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(true));
    server.once("listening", () => {
      server.close(() => resolve(false));
    });
    server.listen({ port: Number(port), host: "127.0.0.1" });
  });
}

async function firstFreePort(candidates) {
  for (const port of candidates) {
    if (!(await isPortBusy(port))) return port;
  }
  return "";
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function choosePort() {
  const suggestions = [5174, 5175, 3000, 3001, 8080, 8081];

  if (appPort) {
    appPort = validatePort(appPort);
    if (await isPortBusy(appPort)) {
      const suggestion = (await firstFreePort(suggestions)) || 3002;
      throw new Error(`Port ${appPort} is already in use. Try --port ${suggestion}.`);
    }
    return appPort;
  }

  appPort = defaultPort;
  if (!(await isPortBusy(appPort))) return appPort;

  console.log(`Port ${appPort} is already in use.`);

  const freeOptions = [];
  for (const port of suggestions) {
    if (!(await isPortBusy(port))) freeOptions.push(port);
  }

  if (freeOptions.length === 0) {
    throw new Error("No suggested free ports found. Run again with --port <number>.");
  }

  if (!process.stdin.isTTY) {
    appPort = freeOptions[0];
    console.log(`Using available port ${appPort}.`);
    return appPort;
  }

  console.log("Choose a port:");
  freeOptions.forEach((port, index) => console.log(`  ${index + 1}) ${port}`));
  console.log("  c) Custom");
  const selection = (await ask("Selection [1]: ")) || "1";

  if (selection.toLowerCase() === "c") {
    const customPort = await ask("Custom port: ");
    appPort = validatePort(customPort);
    if (await isPortBusy(appPort)) throw new Error(`Port ${appPort} is already in use.`);
    return appPort;
  }

  const index = Number(selection);
  if (!Number.isInteger(index) || index < 1 || index > freeOptions.length) {
    throw new Error("Invalid selection.");
  }

  appPort = freeOptions[index - 1];
  return appPort;
}

function waitForUrl(url) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    process.stdout.write("Waiting for HelpPS");

    const check = () => {
      attempts += 1;
      const request = http.get(url, (response) => {
        response.resume();
        if (response.statusCode && response.statusCode >= 200 && response.statusCode < 500) {
          process.stdout.write(os.EOL);
          resolve();
        } else {
          retry();
        }
      });
      request.on("error", retry);
      request.setTimeout(1500, () => {
        request.destroy();
        retry();
      });
    };

    const retry = () => {
      if (attempts >= 60) {
        process.stdout.write(os.EOL);
        reject(new Error(`HelpPS did not respond at ${url}.`));
        return;
      }
      process.stdout.write(".");
      setTimeout(check, 1000);
    };

    check();
  });
}

function openUrl(url) {
  if (!openBrowser) return;
  if (process.platform === "win32") {
    spawn("cmd", ["/c", "start", "", url], { detached: true, stdio: "ignore" }).unref();
  } else if (process.platform === "darwin") {
    spawn("open", [url], { detached: true, stdio: "ignore" }).unref();
  } else {
    spawn("xdg-open", [url], { detached: true, stdio: "ignore" }).unref();
  }
}

async function startApp(compose, projectRoot) {
  const port = await choosePort();
  const url = process.env.APP_URL || `http://localhost:${port}`;
  const env = { ...process.env, APP_PORT: String(port) };

  console.log(`Starting HelpPS on ${url}`);
  const result = runCompose(compose, projectRoot, ["up", "--build", "-d"], { env });
  if (result.error || result.status !== 0) {
    throw new Error("Docker Compose failed to start HelpPS.");
  }

  try {
    await waitForUrl(url);
  } catch (error) {
    runCompose(compose, projectRoot, ["logs", "--tail=80", "web"], { env });
    throw error;
  }

  openUrl(url);
  console.log("");
  console.log("HelpPS is running:");
  console.log(`  ${url}`);
  console.log("");
  console.log("Useful commands:");
  console.log("  HelpPSRunner.exe --logs");
  console.log("  HelpPSRunner.exe --stop");
}

async function main() {
  parseArgs(process.argv.slice(2));
  if (action === "help") {
    usage();
    return;
  }

  banner();
  const projectRoot = findProjectRoot();
  const compose = requireDocker(projectRoot);

  if (action === "stop") {
    const result = runCompose(compose, projectRoot, ["down"]);
    if (result.error || result.status !== 0) throw new Error("Docker Compose failed to stop HelpPS.");
    console.log("HelpPS stopped.");
    return;
  }

  if (action === "logs") {
    const result = runCompose(compose, projectRoot, ["logs", "--tail=120", "-f"]);
    if (result.error || result.status !== 0) throw new Error("Docker Compose failed to read logs.");
    return;
  }

  await startApp(compose, projectRoot);
}

main().catch((error) => {
  console.error("");
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
  if (process.platform === "win32" && process.stdin.isTTY) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question("Press Enter to exit.", () => rl.close());
  }
});
