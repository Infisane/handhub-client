import { parsePhoneNumberFromString } from "libphonenumber-js/max";
import { z } from "zod";

export const PHONE_HINT =
	"Outside Nigeria? Start with + and your country code.";

/**
 * Same rule the API applies: a number without "+" is read as Nigerian
 * (08012345678, 8012345678); any other country needs +<country code>.
 * Uses the /max metadata build because the API does — /min is laxer and would pass
 * numbers like 07911123456 that the server then rejects.
 */
export const isValidPhone = (value: string) =>
	parsePhoneNumberFromString(value, "NG")?.isValid() ?? false;

export const PhoneSchema = z
	.string()
	.refine(isValidPhone, `Enter a valid phone number. ${PHONE_HINT}`);
