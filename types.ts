
export interface PixelBlock {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  ownerId: string;
  imageUrl?: string;
  linkUrl?: string;
  color: string;
  text?: string;
  createdAt: number;
}

export interface Selection {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  isActive: boolean;
  isOverlapping: boolean;
}

export interface ViewState {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export interface Point {
  x: number;
  y: number;
}
