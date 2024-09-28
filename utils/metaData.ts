export class MetaData {
  constructor(public id: number, public totalSize: number) {}

  static fromData(uint8Array: Uint8Array) {
    // 获取元信息
    const dataView = new DataView(uint8Array.buffer);
    const id = dataView.getUint32(0, true);
    const totalSize = dataView.getUint32(4, true);

    const data = uint8Array.slice(8);
    return [new MetaData(id, totalSize), data] as const;
  }

  bytes(data?: Uint8Array) {
    const metaData = new Uint8Array(8);
    const dataView = new DataView(metaData.buffer);
    dataView.setUint32(0, this.id, true);
    dataView.setUint32(4, this.totalSize, true);
    if (data) {
      return new Uint8Array([...metaData, ...data]);
    }
    return metaData;
  }
}

export class ChunkMetaData {
  constructor(
    public id: number,
    public start: number,
    public chunkSize: number
  ) {}

  static fromData(uint8Array: Uint8Array) {
    // 获取元信息
    const dataView = new DataView(uint8Array.buffer);
    const id = dataView.getUint32(0, true);
    const start = dataView.getUint32(4, true);
    const chunkSize = dataView.getUint32(8, true);

    const data = uint8Array.slice(12);
    return [new ChunkMetaData(id, start, chunkSize), data] as const;
  }

  bytes(data?: Uint8Array) {
    const metaData = new Uint8Array(12);
    const dataView = new DataView(metaData.buffer);
    dataView.setUint32(0, this.id, true);
    dataView.setUint32(4, this.start, true);
    dataView.setUint32(8, this.chunkSize, true);

    if (data) {
      return new Uint8Array([...metaData, ...data]);
    }
    return metaData;
  }
}
