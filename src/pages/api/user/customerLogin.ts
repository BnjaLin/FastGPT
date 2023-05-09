// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@/service/response';
import { AuthCode, connectToDatabase, Model, User } from '@/service/mongo';
import { Customer } from '@/service/models/customer';
import { generateToken } from '@/service/utils/tools';
import { UserAuthTypeEnum } from '@/constants/common';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 客户使用手机号作为 username , 短信验证码 code , 所属知识库 base
    const { username, code, email } = req.body;

    if (!(username && code && email)) {
      throw new Error('缺少参数');
    }

    await connectToDatabase();

    const user = await User.findOne({ username: email });
    if (!user) {
      throw new Error('用户不存在');
    }

    const authCode = await AuthCode.findOne({
      username,
      code,
      type: UserAuthTypeEnum.mobileMessages,
      expiredTime: { $gte: Date.now() }
    });

    if (!authCode) {
      throw new Error('验证码错误');
    }

    let customer;

    // 检测用户是否存在
    const authUser = await Customer.findOne({
      username
    });

    if (authUser) {
      customer = authUser;
    } else {
      // 若没有此用户则创建一个
      const response = await Customer.create({ username, belongs: email });
      customer = await Customer.findById(response._id);
    }

    res.setHeader('Set-Cookie', `token=${generateToken(customer!._id)}; Path=/; HttpOnly`);

    jsonRes(res, {
      data: {
        customer
      }
    });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
