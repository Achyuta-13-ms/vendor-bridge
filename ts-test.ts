function test(chunk: string | Buffer) {
  if (typeof chunk === 'string') {
    const s: string = chunk;
    return Buffer.from(s);
  } else {
    const b: Uint8Array = chunk;
    return Buffer.from(b);
  }
}
