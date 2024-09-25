export async function isDirValid(folderName: string) {
  if (/[A-Z]/.test(folderName)) {
    return false;
  } else {
    return true;
  }
}
