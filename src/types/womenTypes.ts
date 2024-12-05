export interface Woman {
  id?: string;
  firstName: string;
  lastName: string;
  age: number;
  region: string;
  department: string;
  commune: string;
  activity: string;
  phoneNumber?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WomanStats {
  totalCount: number;
  byRegion: Array<{
    _id: string;
    count: number;
    averageAge: number;
    activities: string[];
  }>;
  ageDistribution: Array<{
    _id: number;
    count: number;
    women: Array<{
      name: string;
      age: number;
    }>;
  }>;
  activityStats: Array<{
    _id: string;
    count: number;
    averageAge: number;
    regions: string[];
  }>;
  departmentStats: Array<{
    _id: string;
    count: number;
    activities: string[];
    communes: string[];
  }>;
  monthlyTrends: Array<{
    _id: {
      year: number;
      month: number;
    };
    count: number;
  }>;
  communeStats: Array<{
    _id: string;
    count: number;
    activities: string[];
    averageAge: number;
  }>;
  activityByRegion: Array<{
    _id: string;
    activities: Array<{
      activity: string;
      count: number;
    }>;
  }>;
  ageGroupByActivity: Array<{
    _id: string;
    ageGroups: Array<{
      range: string;
      count: number;
    }>;
  }>;
  summary: {
    totalWomen: number;
    topRegion: string;
    topActivity: string;
    averageAgeOverall: number;
    totalDepartments: number;
    totalCommunes: number;
    recentTrend: Array<{
      _id: {
        year: number;
        month: number;
      };
      count: number;
    }>;
  };
}

export interface QueryFilters {
  region?: string;
  department?: string;
  commune?: string;
  activity?: string;
  minAge?: number;
  maxAge?: number;
}

export interface CreateWomanDto
  extends Omit<Woman, 'id' | 'createdAt' | 'updatedAt'> {}
export interface UpdateWomanDto extends Partial<CreateWomanDto> {}
