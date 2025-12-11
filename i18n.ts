import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale;
 
  // Ensure that incoming locale is valid
  if (!locale || !['es', 'en', 'zh'].includes(locale)) {
    locale = 'es';
  }
 
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
