import { describe, it, expect } from "vitest";
import {
  convertPersianToEnglish,
  convertEnglishToPersian,
  normalizeFormData,
  containsNumbers,
  isNumericString,
  persianValidationRules,
} from "../persian-validation";

describe("Persian Number Conversion", () => {
  describe("convertPersianToEnglish", () => {
    it("should convert Persian numbers to English", () => {
      expect(convertPersianToEnglish("۱۲۳۴۵۶۷۸۹۰")).toBe("1234567890");
      expect(convertPersianToEnglish("محمد ۱۲۳")).toBe("محمد 123");
      expect(convertPersianToEnglish("۰۹۱۲۳۴۵۶۷۸۹")).toBe("09123456789");
    });

    it("should handle mixed Persian and English numbers", () => {
      expect(convertPersianToEnglish("12۳۴56")).toBe("123456");
      expect(convertPersianToEnglish("test ۱۲3")).toBe("test 123");
    });

    it("should handle text without numbers", () => {
      expect(convertPersianToEnglish("محمد احمدی")).toBe("محمد احمدی");
      expect(convertPersianToEnglish("")).toBe("");
    });
  });

  describe("convertEnglishToPersian", () => {
    it("should convert English numbers to Persian", () => {
      expect(convertEnglishToPersian("1234567890")).toBe("۱۲۳۴۵۶۷۸۹۰");
      expect(convertEnglishToPersian("محمد 123")).toBe("محمد ۱۲۳");
      expect(convertEnglishToPersian("09123456789")).toBe("۰۹۱۲۳۴۵۶۷۸۹");
    });

    it("should handle mixed Persian and English numbers", () => {
      expect(convertEnglishToPersian("12۳۴56")).toBe("۱۲۳۴۵۶");
      expect(convertEnglishToPersian("test 12۳")).toBe("test ۱۲۳");
    });

    it("should handle text without numbers", () => {
      expect(convertEnglishToPersian("محمد احمدی")).toBe("محمد احمدی");
      expect(convertEnglishToPersian("")).toBe("");
    });
  });

  describe("normalizeFormData", () => {
    it("should normalize Persian numbers in FormData", () => {
      const formData = new FormData();
      formData.append("name", "محمد احمدی");
      formData.append("phone", "۰۹۱۲۳۴۵۶۷۸۹");
      formData.append("ssn", "۰۰۱۲۳۴۵۶۷۸");
      formData.append("amount", "۱۰۰۰۰۰");

      const normalized = normalizeFormData(formData);

      expect(normalized.get("name")).toBe("محمد احمدی");
      expect(normalized.get("phone")).toBe("09123456789");
      expect(normalized.get("ssn")).toBe("0012345678");
      expect(normalized.get("amount")).toBe("100000");
    });

    it("should handle mixed Persian and English numbers", () => {
      const formData = new FormData();
      formData.append("mixed", "12۳۴56");
      formData.append("text", "test ۱۲3");

      const normalized = normalizeFormData(formData);

      expect(normalized.get("mixed")).toBe("123456");
      expect(normalized.get("text")).toBe("test 123");
    });
  });

  describe("containsNumbers", () => {
    it("should detect Persian numbers", () => {
      expect(containsNumbers("محمد ۱۲۳")).toBe(true);
      expect(containsNumbers("۰۹۱۲۳۴۵۶۷۸۹")).toBe(true);
    });

    it("should detect English numbers", () => {
      expect(containsNumbers("محمد 123")).toBe(true);
      expect(containsNumbers("09123456789")).toBe(true);
    });

    it("should detect mixed numbers", () => {
      expect(containsNumbers("12۳۴56")).toBe(true);
    });

    it("should return false for text without numbers", () => {
      expect(containsNumbers("محمد احمدی")).toBe(false);
      expect(containsNumbers("")).toBe(false);
    });
  });

  describe("isNumericString", () => {
    it("should validate Persian numeric strings", () => {
      expect(isNumericString("۱۲۳۴۵")).toBe(true);
      expect(isNumericString("۱۲۳.۴۵")).toBe(true);
      expect(isNumericString("۰")).toBe(true);
    });

    it("should validate English numeric strings", () => {
      expect(isNumericString("12345")).toBe(true);
      expect(isNumericString("123.45")).toBe(true);
      expect(isNumericString("0")).toBe(true);
    });

    it("should validate mixed numeric strings", () => {
      expect(isNumericString("12۳۴5")).toBe(true);
      expect(isNumericString("12.۳۴")).toBe(true);
    });

    it("should return false for non-numeric strings", () => {
      expect(isNumericString("محمد")).toBe(false);
      expect(isNumericString("12a34")).toBe(false);
      expect(isNumericString("")).toBe(false);
    });
  });
});

describe("Persian Validation Rules with Number Support", () => {
  describe("persianPhone", () => {
    it("should accept Persian phone numbers", () => {
      expect(persianValidationRules.persianPhone("۰۹۱۲۳۴۵۶۷۸۹")).toBeNull();
      expect(persianValidationRules.persianPhone("۹۱۲۳۴۵۶۷۸۹")).toBeNull();
    });

    it("should accept English phone numbers", () => {
      expect(persianValidationRules.persianPhone("09123456789")).toBeNull();
      expect(persianValidationRules.persianPhone("9123456789")).toBeNull();
    });

    it("should accept mixed phone numbers", () => {
      expect(persianValidationRules.persianPhone("۰۹12345678۹")).toBeNull();
    });

    it("should reject invalid phone numbers", () => {
      expect(persianValidationRules.persianPhone("123")).not.toBeNull();
      expect(persianValidationRules.persianPhone("")).not.toBeNull();
    });
  });

  describe("persianSSN", () => {
    it("should accept Persian SSN", () => {
      // Using a valid Iranian national code: 0499370899
      expect(persianValidationRules.persianSSN("۰۴۹۹۳۷۰۸۹۹")).toBeNull();
    });

    it("should accept English SSN", () => {
      // Using a valid Iranian national code: 0499370899
      expect(persianValidationRules.persianSSN("0499370899")).toBeNull();
    });

    it("should accept mixed SSN", () => {
      // Using a valid Iranian national code: 0499370899
      expect(persianValidationRules.persianSSN("۰۴99370۸۹۹")).toBeNull();
    });

    it("should reject invalid SSN", () => {
      expect(persianValidationRules.persianSSN("123")).not.toBeNull();
      expect(persianValidationRules.persianSSN("")).not.toBeNull();
      expect(persianValidationRules.persianSSN("0012345678")).not.toBeNull(); // Invalid checksum
    });
  });

  describe("persianPostalCode", () => {
    it("should accept Persian postal codes", () => {
      expect(persianValidationRules.persianPostalCode("۱۲۳۴۵۶۷۸۹۰")).toBeNull();
    });

    it("should accept English postal codes", () => {
      expect(persianValidationRules.persianPostalCode("1234567890")).toBeNull();
    });

    it("should accept mixed postal codes", () => {
      expect(persianValidationRules.persianPostalCode("۱۲345678۹۰")).toBeNull();
    });

    it("should reject invalid postal codes", () => {
      expect(persianValidationRules.persianPostalCode("123")).not.toBeNull();
      expect(persianValidationRules.persianPostalCode("")).not.toBeNull();
    });
  });

  describe("currency", () => {
    it("should accept Persian currency values", () => {
      expect(persianValidationRules.currency("۱۰۰۰۰۰")).toBeNull();
      expect(persianValidationRules.currency("۱۲۳.۴۵")).toBeNull();
    });

    it("should accept English currency values", () => {
      expect(persianValidationRules.currency("100000")).toBeNull();
      expect(persianValidationRules.currency("123.45")).toBeNull();
    });

    it("should accept mixed currency values", () => {
      expect(persianValidationRules.currency("۱۰۰000")).toBeNull();
      expect(persianValidationRules.currency("12۳.4۵")).toBeNull();
    });

    it("should reject invalid currency values", () => {
      expect(persianValidationRules.currency("abc")).not.toBeNull();
      expect(persianValidationRules.currency("-100")).not.toBeNull();
    });
  });
});