import { connectToDatabase, Bill, User, Customer } from '../mongo';
import { ChatModelMap, OpenAiChatEnum, ChatModelType, embeddingModel } from '@/constants/model';
import { BillTypeEnum } from '@/constants/user';

export const pushChatBill = async ({
  isPay,
  chatModel,
  userId,
  chatId,
  textLen,
  tokens
}: {
  isPay: boolean;
  chatModel: ChatModelType;
  userId: string;
  chatId?: '' | string;
  textLen: number;
  tokens: number;
}) => {
  console.log(`chat generate success. text len: ${textLen}. token len: ${tokens}. pay:${isPay}`);
  if (!isPay) return;

  let billId = '';

  try {
    await connectToDatabase();

    // 计算价格
    const unitPrice = ChatModelMap[chatModel]?.price || 5;
    const price = unitPrice * tokens;

    try {
      // 插入 Bill 记录
      const res = await Bill.create({
        userId,
        type: 'chat',
        modelName: chatModel,
        chatId: chatId ? chatId : undefined,
        textLen,
        tokenLen: tokens,
        price
      });
      billId = res._id;

      // 账号扣费
      let user = await User.findById(userId);
      if (user) {
        // 云平台访问
        await User.findByIdAndUpdate(userId, {
          $inc: { balance: -price }
        });
      } else {
        let customer = await Customer.findById(userId);
        if (customer) {
          await User.findOneAndUpdate(
            { username: customer.belongs },
            {
              $inc: { balance: -price }
            }
          );
          await Customer.findByIdAndUpdate(userId, {
            $inc: { balance: -price }
          });
        }
      }
    } catch (error) {
      console.log('创建账单失败:', error);
      billId && Bill.findByIdAndDelete(billId);
    }
  } catch (error) {
    console.log(error);
  }
};

export const pushSplitDataBill = async ({
  isPay,
  userId,
  totalTokens,
  textLen,
  type
}: {
  isPay: boolean;
  userId: string;
  totalTokens: number;
  textLen: number;
  type: `${BillTypeEnum}`;
}) => {
  console.log(
    `splitData generate success. text len: ${textLen}. token len: ${totalTokens}. pay:${isPay}`
  );
  if (!isPay) return;

  let billId;

  try {
    await connectToDatabase();

    // 获取模型单价格, 都是用 gpt35 拆分
    const unitPrice = ChatModelMap[OpenAiChatEnum.GPT35].price || 3;
    // 计算价格
    const price = unitPrice * totalTokens;

    // 插入 Bill 记录
    const res = await Bill.create({
      userId,
      type,
      modelName: OpenAiChatEnum.GPT35,
      textLen,
      tokenLen: totalTokens,
      price
    });
    billId = res._id;

    // 账号扣费
    let user = await User.findById(userId);
    if (user) {
      // 云平台访问
      await User.findByIdAndUpdate(userId, {
        $inc: { balance: -price }
      });
    } else {
      let customer = await Customer.findById(userId);
      if (customer) {
        await User.findOneAndUpdate(
          { username: customer.belongs },
          {
            $inc: { balance: -price }
          }
        );
        await Customer.findByIdAndUpdate(userId, {
          $inc: { balance: -price }
        });
      }
    }
  } catch (error) {
    console.log('创建账单失败:', error);
    billId && Bill.findByIdAndDelete(billId);
  }
};

export const pushGenerateVectorBill = async ({
  isPay,
  userId,
  text,
  tokenLen
}: {
  isPay: boolean;
  userId: string;
  text: string;
  tokenLen: number;
}) => {
  console.log(
    `vector generate success. text len: ${text.length}. token len: ${tokenLen}. pay:${isPay}`
  );
  if (!isPay) return;

  let billId;

  try {
    await connectToDatabase();

    try {
      const unitPrice = 0.4;
      // 计算价格. 至少为1
      let price = unitPrice * tokenLen;
      price = price > 1 ? price : 1;

      // 插入 Bill 记录
      const res = await Bill.create({
        userId,
        type: BillTypeEnum.vector,
        modelName: embeddingModel,
        textLen: text.length,
        tokenLen,
        price
      });
      billId = res._id;

      // 账号扣费
      let user = await User.findById(userId);
      if (user) {
        // 云平台访问
        await User.findByIdAndUpdate(userId, {
          $inc: { balance: -price }
        });
      } else {
        let customer = await Customer.findById(userId);
        if (customer) {
          await User.findOneAndUpdate(
            { username: customer.belongs },
            {
              $inc: { balance: -price }
            }
          );
          await Customer.findByIdAndUpdate(userId, {
            $inc: { balance: -price }
          });
        }
      }
    } catch (error) {
      console.log('创建账单失败:', error);
      billId && Bill.findByIdAndDelete(billId);
    }
  } catch (error) {
    console.log(error);
  }
};
