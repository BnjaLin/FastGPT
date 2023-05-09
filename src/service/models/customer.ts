import { Schema, model, models, Model } from 'mongoose';
import { PRICE_SCALE } from '@/constants/common';
import { CustomerModelSchema } from '@/types/mongoSchema';

const CustomerSchema = new Schema({
  username: {
    // 手机
    type: String,
    required: true,
    unique: true // 唯一
  },
  avatar: {
    type: String,
    default: '/icon/human.png'
  },
  balance: {
    // 平台余额，不可提现
    type: Number,
    default: 5 * PRICE_SCALE
  },
  createTime: {
    type: Date,
    default: () => new Date()
  },
  belongs: {
    type: String,
    required: true
  }
});

export const Customer: Model<CustomerModelSchema> =
  models['customer'] || model('customer', CustomerSchema);
