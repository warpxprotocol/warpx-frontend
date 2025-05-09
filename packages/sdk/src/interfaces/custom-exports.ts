// packages/sdk/src/interfaces/custom-exports.ts
type Enum = any; // 실제 Enum 타입 import 또는 선언
type u32 = any; // 실제 u32 타입 import 또는 선언

export interface FrameSupportTokensFungibleUnionOfNativeOrWithId extends Enum {
  readonly isNative: boolean;
  readonly isWithId: boolean;
  readonly asWithId: u32;
  readonly type: 'Native' | 'WithId';
}
