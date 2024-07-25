export interface Sizes {
  width: number
  height: number
}

export interface GameEntity {
  update(delta: number): void
  resize?(): void
}
