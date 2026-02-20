import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function generateVanity(prefix?: string, suffix?: string): Promise<string> {
  if (!prefix && !suffix) {
    throw new Error("Prefix or suffix is required");
  }

  let normalizedPrefix = prefix ?? "";
  let normalizedSuffix = suffix ?? "";

  if (normalizedPrefix.startsWith('0x')) {
    normalizedPrefix = normalizedPrefix.slice(2);
  }
  if (normalizedSuffix.startsWith('0x')) {
    normalizedSuffix = normalizedSuffix.slice(2);
  }

  if (normalizedPrefix.length + normalizedSuffix.length > 5) {
    throw new Error("Combined length of prefix and suffix cannot be greater than 5 characters");
  }

  const command = "./bin/safe-vanity";
  let cmd = `${command} -q`;
  if (normalizedPrefix) {
    cmd += ` --prefix ${normalizedPrefix}`;
  }
  if (normalizedSuffix) {
    cmd += ` --suffix ${normalizedSuffix}`;
  }
  const { stdout } = await execAsync(cmd);
  const privateKey = stdout.trim();
  return privateKey;
}
