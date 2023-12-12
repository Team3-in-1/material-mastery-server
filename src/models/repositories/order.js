const moment = require('moment-timezone');
const Order = require('../order.model');
const { getSortAscending, getSortDescending, getUnSelectData } = require('../../utils');

const calculateRevenueByTimeRange = async (startTime, endTime) => {
  const totalRevenue = await Order.aggregate([
    {
      $match: {
        order_date: {
          $gte: startTime.toDate(),
          $lt: endTime.toDate(),
        },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$order_checkout.finalPrice' },
      },
    },
  ]);

  return totalRevenue.length ? totalRevenue[0].totalRevenue : 0;
};

const calculateRevenueByDay = async () => {
  const now = moment().tz('Asia/Ho_Chi_Minh');
  const startOfDay = now.clone().startOf('day');
  const endOfDay = now.clone().endOf('day');

  const totalRevenue = await calculateRevenueByTimeRange(startOfDay, endOfDay);

  return totalRevenue;
};

const calculateRevenueByWeek = async () => {
  const now = moment().tz('Asia/Ho_Chi_Minh');
  const startOfWeek = now.clone().startOf('isoWeek').startOf('day');
  const endOfWeek = now.clone().endOf('isoWeek').endOf('day');

  const totalRevenue = await calculateRevenueByTimeRange(startOfWeek, endOfWeek);

  return totalRevenue;
};

const calculateRevenueByMonth = async () => {
  const now = moment().tz('Asia/Ho_Chi_Minh');
  const startOfMonth = now.clone().startOf('month');
  const endOfMonth = now.clone().endOf('month');

  const totalRevenue = await calculateRevenueByTimeRange(startOfMonth, endOfMonth);

  return totalRevenue;
};

const calculateRevenueByQuarter = async () => {
  const now = moment().tz('Asia/Ho_Chi_Minh');
  const startOfQuarter = now.clone().startOf('quarter');
  const endOfQuarter = now.clone().endOf('quarter');

  const totalRevenue = await calculateRevenueByTimeRange(startOfQuarter, endOfQuarter);

  return totalRevenue;
};

const calculateRevenueByYear = async () => {
  const now = moment().tz('Asia/Ho_Chi_Minh');
  const startOfYear = now.clone().startOf('year');
  const endOfYear = now.clone().endOf('year');

  const totalRevenue = await calculateRevenueByTimeRange(startOfYear, endOfYear);

  return totalRevenue;
};

const getOrdersByUser = async ({limit = 50, page = 1, sorted = ["_id"], filter = {}, unSelect = [], isAscending = true}) => {
  return await Order.find(filter)
  .skip((page - 1) * limit)
  .limit(limit)
  .sort(isAscending === 'true' ? getSortAscending(sorted) : getSortDescending(sorted))
  .select(getUnSelectData(unSelect))
  .lean()
}

const updateOrderById = async (id, payload) => {
  return await Order.findByIdAndUpdate(id, payload, { new: true });
}

module.exports = {
  calculateRevenueByDay,
  calculateRevenueByWeek,
  calculateRevenueByMonth,
  calculateRevenueByQuarter,
  calculateRevenueByYear,
  getOrdersByUser,
  updateOrderById,
};