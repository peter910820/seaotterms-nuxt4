import type { UserInfo } from "@/types/user";

// response的型別(DTO)

export interface CommonResponse<T = null> {
  statusCode: number;
  errMsg: string;
  infoMsg: string;
  userInfo: UserInfo | null;
  data: T;
}

export interface ArticleQueryResponse {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags: TagQueryResponse[];
}

export interface TagQueryResponse {
  name: string;
  iconName: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BrandQueryResponse {
  id: number;
  name: string;
  workAmount: number;
  officialUrl: string;
  dissolution: boolean;
  createdAt: Date;
  createdName: string;
  updatedAt: Date;
  updatedName: string;
}

export interface GameQueryResponse {
  id: number;
  name: string;
  chineseName: string;
  brandId: number;
  allAges: boolean;
  releaseDate: string; // Date
  OpUrl: string;
  gameDescription: string;
  createdAt: Date;
  createdName: string;
  updatedAt: Date;
  updatedName: string;
}

export interface TodoTopicQueryResponse {
  topicName: string;
  topicOwner: string;
  updatedAt: Date;
  updateName: string | null;
}

export interface TodoQueryResponse {
  id: number;
  owner: string;
  topic: string;
  title: string;
  status: number;
  deadline: Date | null;
  createdAt: Date;
  createName: string;
  updatedAt: Date | null;
  updateName: string | null;
}

export interface SystemTodoQueryResponse {
  id: number;
  systemName: string;
  title: string;
  detail: string; // it may be an empty string
  status: number;
  deadline: Date | null;
  urgency: number;
  createdAt: Date;
  createdName: string;
  updatedAt: Date | null;
  updatedName: string | null;
}

export interface BrandRecordQueryResponse {
  brand: string;
  completed: number;
  total: number;
  annotation: string;
  dissolution: boolean;
  inputTime: string | Date;
  inputName: string;
  updateTime: string | Date;
  updateName: string;
}

export interface UserQueryResponse {
  id: number;
  username: string;
  exp: number;
  management: boolean;
  updateAt: string;
  updateName: string;
}

// kurohelper-api common response(200)
export interface KuroHelperAPIOK<T = null> {
  message: string;
  data: T;
}

export interface GetUserGameResponse {
  games: UserGameResponse[];
}

export interface UserGameResponse {
  userId: number;
  gameErogsId: number;
  status: number;
  finishedDate?: string | null;
  createdAt: string;
  gameErogs?: {
    name: string;
    brandErogs?: { id: number; name: string };
  };
}
