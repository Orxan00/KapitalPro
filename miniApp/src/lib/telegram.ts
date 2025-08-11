import { retrieveLaunchParams } from '@telegram-apps/sdk';
//  intializing user  to fetch the user data
const { initData } = retrieveLaunchParams();
export const telegramId = initData?.user?.id;
export const userName = initData?.user?.username;
export const firstName = initData?.user?.firstName;
export const lastName = initData?.user?.lastName;
export const referredBy = initData?.startParam;
export const languageCode = initData?.user?.languageCode;
export const profilePicture = initData?.user?.photoUrl
export const startParam = initData?.startParam

// Get Telegram user data in a structured format
export const getTelegramUser = () => {
  if (!telegramId) {
    return null;
  }

  return {
    id: telegramId,
    username: userName,
    first_name: firstName,
    last_name: lastName,
    language_code: languageCode,
    is_premium: false, // Default to false, can be updated if needed
    photo_url: profilePicture,
    start_param: startParam,
    referred_by: referredBy,
  };
};