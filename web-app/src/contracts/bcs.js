import { ethers } from 'ethers';

class BCS {
  constructor() {
    this.MAX_SEQUENCE_LENGTH = 1_000_000; // Example max sequence length
    this.MAX_CONTAINER_DEPTH = 100; // Example max container depth
  }

  // Serialize a boolean
  serializeBool(value) {
    return new Uint8Array([value ? 1 : 0]);
  }

  // Serialize an unsigned 8-bit integer
  serializeU8(value) {
    const buffer = new ArrayBuffer(1);
    const view = new DataView(buffer);
    view.setUint8(0, value);
    return new Uint8Array(buffer);
  }

  // Serialize an unsigned 32-bit integer as ULEB128
  serializeU32AsUleb128(value) {
    const bytes = [];
    while (value >= 0x80) {
      bytes.push((value & 0x7f) | 0x80); // Set the 8th bit to 1
      value >>>= 7;
    }
    bytes.push(value & 0x7f); // Set the 8th bit to 0
    return new Uint8Array(bytes);
  }

  // Serialize an unsigned 32-bit integer
  serializeU32(value) {
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setUint32(0, value, true); // Little-endian
    return new Uint8Array(buffer);
  }

  // Serialize an unsigned 64-bit integer
  serializeU64(value) {
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    view.setBigUint64(0, BigInt(value), true); // Little-endian
    return new Uint8Array(buffer);
  }

  // Serialize a variable-length sequence (e.g., vector)
  serializeVector(elements, elementSerializer, includeLengthPrefix = true) {
    const length = elements.length;
    if (length > this.MAX_SEQUENCE_LENGTH) {
      throw new Error("Exceeded max sequence length");
    }

    const elementBytes = elements.map(elementSerializer).flat();

    // Optionally include the length prefix
    if (includeLengthPrefix) {
      const lengthBytes = this.serializeU32AsUleb128(length); // Serialize length as ULEB128
      return new Uint8Array([...lengthBytes, ...elementBytes]);
    } else {
      return new Uint8Array([...elementBytes]);
    }
  }

  // Serialize a string (UTF-8 encoded)
  serializeString(value) {
    const encoder = new TextEncoder();
    const utf8Bytes = encoder.encode(value);
    return this.serializeVector(Array.from(utf8Bytes), (byte) =>
      this.serializeU8(byte)
    );
  }

  // Serialize an optional value
  serializeOption(value, valueSerializer) {
    if (value === null || value === undefined) {
      return new Uint8Array([0]);
    } else {
      return new Uint8Array([1, ...valueSerializer(value)]);
    }
  }

  // Serialize a struct (fixed sequence of fields)
  serializeStruct(fields, fieldSerializers) {
    let serialized = new Uint8Array([]);
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      const serializer = fieldSerializers[i];
      serialized = new Uint8Array([...serialized, ...serializer(field)]);
    }
    return serialized;
  }

  // Serialize a Sui address (32 bytes)
  serializeAddress(address) {
    // Remove the "0x" prefix if present
    const cleanAddress = address.startsWith("0x") ? address.slice(2) : address;

    // Convert the address to a Uint8Array
    const addressBytes = new Uint8Array(cleanAddress.length / 2);
    for (let i = 0; i < cleanAddress.length; i += 2) {
      addressBytes[i / 2] = parseInt(cleanAddress.substr(i, 2), 16);
    }

    // Ensure the address is 32 bytes (64 hex characters)
    if (addressBytes.length !== 32) {
      throw new Error("Invalid Sui address length. Expected 32 bytes.");
    }

    return addressBytes;
  }

  // Serialize an Ethereum address (20 bytes) with a length prefix
  serializeEthAddress(address) {
    // Convert Ethereum address to a 20-byte Uint8Array
    const ethAddressBytes = ethers.getBytes(ethers.getAddress(address));
  
    // Create a new Uint8Array with 21 bytes (1 byte for length + 20 bytes for address)
    const serializedEthAddress = new Uint8Array(21);
    serializedEthAddress[0] = 20; // First byte is the length
    serializedEthAddress.set(ethAddressBytes, 1); // Add the 20-byte address after the length
  
    return serializedEthAddress;
  }

  // Deserialize a boolean
  deserializeBool(bytes) {
    return bytes[0] === 1;
  }

  // Deserialize an unsigned 8-bit integer
  deserializeU8(bytes) {
    return bytes[0];
  }

  // Deserialize an unsigned 32-bit integer
  deserializeU32(bytes) {
    const buffer = bytes.buffer;
    const view = new DataView(buffer);
    return view.getUint32(0, true); // Little-endian
  }

  // Deserialize an unsigned 64-bit integer
  deserializeU64(bytes) {
    const buffer = bytes.buffer;
    const view = new DataView(buffer);
    return Number(view.getBigUint64(0, true)); // Little-endian
  }

  // Deserialize a variable-length sequence (e.g., vector)
  deserializeVector(bytes, elementDeserializer) {
    const length = this.deserializeU32(bytes.slice(0, 4));
    const elements = [];
    let offset = 4;
    for (let i = 0; i < length; i++) {
      const element = elementDeserializer(bytes.slice(offset));
      elements.push(element.value);
      offset += element.byteLength;
    }
    return { value: elements, byteLength: offset };
  }

  // Deserialize a string (UTF-8 encoded)
  deserializeString(bytes) {
    const vectorResult = this.deserializeVector(bytes, (byte) => ({
      value: this.deserializeU8(byte),
      byteLength: 1,
    }));
    const utf8Bytes = new Uint8Array(vectorResult.value);
    const decoder = new TextDecoder();
    return { value: decoder.decode(utf8Bytes), byteLength: vectorResult.byteLength };
  }

  // Deserialize an optional value
  deserializeOption(bytes, valueDeserializer) {
    if (bytes[0] === 0) {
      return { value: null, byteLength: 1 };
    } else {
      const valueResult = valueDeserializer(bytes.slice(1));
      return { value: valueResult.value, byteLength: 1 + valueResult.byteLength };
    }
  }
}

export default BCS;