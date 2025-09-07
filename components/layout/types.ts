export interface FurnitureItem {
  id: string
  type: 'desk' | 'door'
  positions: Array<{ row: number, col: number }>
  rotation?: 'horizontal' | 'vertical'
}

export type ToolType = 'seat' | 'desk' | 'door'
export type Rotation = 'horizontal' | 'vertical'