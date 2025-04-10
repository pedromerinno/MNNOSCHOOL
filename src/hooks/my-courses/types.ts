
import { useState } from "react";

export type FilterOption = 'all' | 'favorites' | 'completed' | 'in-progress';

export interface CourseStats {
  favorites: number;
  inProgress: number;
  completed: number;
  videosCompleted: number;
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  instructor?: string;
  tags?: string[];
  progress?: number;
  completed?: boolean;
  last_accessed?: string;
  favorite?: boolean;
}
