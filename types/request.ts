// request的型別(DTO)

export interface LoginRequest {
  username: string;
  password: string;
}

export interface ArticleCreateRequest {
  title: string;
  username: string;
  tags: string[];
  content: string;
}

export interface ArticleUpdateRequest {
  title: string;
  content: string;
  tags: { name: string }[];
}

export interface BrandCreateRequest {
  name: string;
  workAmount: number;
  officialUrl: string;
  dissolution: boolean;
}

export interface SystemTodoCreateRequest {
  systemName: string;
  title: string;
  detail: string;
  status: number;
  deadline: string | null; // 為了後續處理所以這邊定義是string
  urgency: number;
  createdName: string;
}

export interface TodoCreateRequest {
  owner: string;
  topic: string;
  title: string;
  status: number;
  deadline: Date | null;
  createName: string;
  updateName: string;
}

export interface TodoTopicCreateRequest {
  topicName: string;
  topicOwner: string;
  updatedAt: string | Date;
  updateName: string;
}

export interface UserUpdateRequest {
  id: number;
  username: string;
  email: string;
  exp: number;
  management: boolean;
  created_at: string | Date;
  updated_at: string | Date;
  update_name: string;
  avatar: string;
}

export interface TagCreateRequest {
  name: string;
  iconName: string;
}

export interface BrandRecordCreateRequest {
  brand: string;
  username: string;
  completed: number;
  total: number;
  dissolution: boolean;
}

export interface BrandRecordUpdateRequest {
  brand: string;
  username: string;
  completed: number;
  total: number;
  dissolution: boolean;
}

export interface GameRecordCreateRequest {
  username: string;
  name: string;
  brand: string;
  releaseDate: string;
  allAges: boolean;
  endDate: string;

  opDisplayScore: number | null; // OP畫面分數，可能沒有值
  opSongScore: number | null; // OP歌曲分數，可能沒有值
  opCompatibilityScore: number | null; // OP畫面契合度分數，可能沒有值
  edSongScore: number | null; // ED歌曲分數，可能沒有值
  musicScore: number | null; // 音樂分數，可能沒有值(早期遊戲沒有紀錄)
  plotScore: number; // 劇情分數
  artScore: number; // 美術分數
  systemScore: number; // 系統分數
  themeScore: number; // 題材分數
  conclusionScore: number; // 收尾分數
  category: string; // 遊戲類型
  recommended: number; // 私心推薦程度 1到4分別對應不推、普、推、大推(0為未設定)
  experience: string;
}

export interface GameRecordUpdateRequest {
  name: string;
  brand: string;
  releaseDate: string;
  allAges: boolean;
  endDate: string;
  updateTime: string;
  username: string;
}

export interface SystemTodoUpdateRequest {
  id: number;
  systemName: string;
  title: string;
  detail: string;
  status: number;
  deadline: string | null; // 為了後續處理所以這邊定義是string
  urgency: number;
  updatedName: string;
}
