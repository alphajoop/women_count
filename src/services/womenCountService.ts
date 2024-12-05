import {
  Woman,
  WomanStats,
  CreateWomanDto,
  UpdateWomanDto,
  QueryFilters,
} from '../types/womenTypes';
import mongoose from 'mongoose';

const WomanModel = mongoose.model<Woman>(
  'Woman',
  new mongoose.Schema(
    {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      age: { type: Number, required: true },
      region: { type: String, required: true },
      department: { type: String, required: true },
      commune: { type: String, required: true },
      activity: { type: String, required: true },
      phoneNumber: String,
    },
    { timestamps: true }
  )
);

export const WomenCountService = {
  async createWoman(womanData: CreateWomanDto): Promise<Woman> {
    const woman = new WomanModel(womanData);
    return await woman.save();
  },

  async getWomen(filters: QueryFilters): Promise<Woman[]> {
    const query: any = {};

    if (filters.region) query.region = filters.region;
    if (filters.department) query.department = filters.department;
    if (filters.commune) query.commune = filters.commune;
    if (filters.activity) query.activity = filters.activity;
    if (filters.minAge) query.age = { $gte: filters.minAge };
    if (filters.maxAge) query.age = { ...query.age, $lte: filters.maxAge };

    return await WomanModel.find(query);
  },

  async getWomanById(id: string): Promise<Woman | null> {
    return await WomanModel.findById(id);
  },

  async updateWoman(
    id: string,
    updateData: UpdateWomanDto
  ): Promise<Woman | null> {
    return await WomanModel.findByIdAndUpdate(id, updateData, { new: true });
  },

  async deleteWoman(id: string): Promise<Woman | null> {
    return await WomanModel.findByIdAndDelete(id);
  },

  async getStats(): Promise<WomanStats> {
    const [
      totalCount,
      byRegion,
      ageDistribution,
      activityStats,
      departmentStats,
      monthlyTrends,
      communeStats,
      activityByRegion,
      ageGroupByActivity,
    ] = await Promise.all([
      WomanModel.countDocuments(),
      // Regional statistics
      WomanModel.aggregate([
        {
          $group: {
            _id: '$region',
            count: { $sum: 1 },
            averageAge: { $avg: '$age' },
            activities: { $addToSet: '$activity' },
          },
        },
        { $sort: { count: -1 } },
      ]),
      // Age distribution
      WomanModel.aggregate([
        {
          $bucket: {
            groupBy: '$age',
            boundaries: [0, 18, 25, 35, 45, 55, 65, 100],
            default: '65+',
            output: {
              count: { $sum: 1 },
              women: {
                $push: {
                  name: { $concat: ['$firstName', ' ', '$lastName'] },
                  age: '$age',
                },
              },
            },
          },
        },
      ]),
      // Activity statistics
      WomanModel.aggregate([
        {
          $group: {
            _id: '$activity',
            count: { $sum: 1 },
            averageAge: { $avg: '$age' },
            regions: { $addToSet: '$region' },
          },
        },
        { $sort: { count: -1 } },
      ]),
      // Department statistics
      WomanModel.aggregate([
        {
          $group: {
            _id: '$department',
            count: { $sum: 1 },
            activities: { $addToSet: '$activity' },
            communes: { $addToSet: '$commune' },
          },
        },
        { $sort: { count: -1 } },
      ]),
      // Monthly trends
      WomanModel.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      // Commune statistics
      WomanModel.aggregate([
        {
          $group: {
            _id: '$commune',
            count: { $sum: 1 },
            activities: { $addToSet: '$activity' },
            averageAge: { $avg: '$age' },
          },
        },
        { $sort: { count: -1 } },
      ]),
      // Activity by region matrix
      WomanModel.aggregate([
        {
          $group: {
            _id: {
              region: '$region',
              activity: '$activity',
            },
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: '$_id.region',
            activities: {
              $push: {
                activity: '$_id.activity',
                count: '$count',
              },
            },
          },
        },
      ]),
      // Age groups by activity
      WomanModel.aggregate([
        {
          $group: {
            _id: '$activity',
            ageGroups: {
              $push: {
                range: {
                  $switch: {
                    branches: [
                      { case: { $lt: ['$age', 18] }, then: '0-17' },
                      { case: { $lt: ['$age', 25] }, then: '18-24' },
                      { case: { $lt: ['$age', 35] }, then: '25-34' },
                      { case: { $lt: ['$age', 45] }, then: '35-44' },
                      { case: { $lt: ['$age', 55] }, then: '45-54' },
                      { case: { $lt: ['$age', 65] }, then: '55-64' },
                    ],
                    default: '65+',
                  },
                },
                count: 1,
              },
            },
          },
        },
      ]),
    ]);

    return {
      totalCount,
      byRegion,
      ageDistribution,
      activityStats,
      departmentStats,
      monthlyTrends,
      communeStats,
      activityByRegion,
      ageGroupByActivity,
      summary: {
        totalWomen: totalCount,
        topRegion: byRegion[0]?._id || 'N/A',
        topActivity: activityStats[0]?._id || 'N/A',
        averageAgeOverall:
          byRegion.reduce((sum, r) => sum + r.averageAge, 0) / byRegion.length,
        totalDepartments: departmentStats.length,
        totalCommunes: communeStats.length,
        recentTrend: monthlyTrends.slice(-3),
      },
    };
  },
};
