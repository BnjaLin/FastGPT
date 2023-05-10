import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@/service/response';
import { connectToDatabase, Collection, Model, Customer, User } from '@/service/mongo';
import { authToken } from '@/service/utils/auth';
import type { ModelListResponse } from '@/api/response/model';

/* 获取模型列表 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    // 凭证校验
    const customerId = await authToken(req);

    await connectToDatabase();

    let customer = await Customer.findById(customerId);
    if (!customer) {
      throw new Error('用户不存在');
    }

    let user = await User.findOne({ username: customer.belongs });
    if (!user) {
      throw new Error('用户不存在');
    }

    const userId = user._id;

    // 根据 userId 获取模型信息
    const [myModels, myCollections] = await Promise.all([
      Model.find(
        {
          userId
        },
        '_id avatar name chat.systemPrompt'
      ).sort({
        _id: -1
      }),
      Collection.find({
        userId
      }).populate('modelId', '_id avatar name chat.systemPrompt')
    ]);

    jsonRes<ModelListResponse>(res, {
      data: {
        myModels: myModels.map((item) => ({
          _id: item._id,
          name: item.name,
          avatar: item.avatar,
          systemPrompt: item.chat.systemPrompt
        })),
        myCollectionModels: myCollections
          .map((item: any) => ({
            _id: item.modelId?._id,
            name: item.modelId?.name,
            avatar: item.modelId?.avatar,
            systemPrompt: item.modelId?.chat.systemPrompt
          }))
          .filter((item) => !myModels.find((model) => String(model._id) === String(item._id))) // 去重
      }
    });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
