export const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validatePhone = (phone) =>
  /^[0-9]{9,11}$/.test(phone.replace(/\s/g, ''));

export const validateCheckoutForm = ({ firstName, secondName, email, phone, address }) => {
  const errors = {};
  if (!firstName?.trim())  errors.firstName  = 'Vui lòng nhập họ';
  if (!secondName?.trim()) errors.secondName = 'Vui lòng nhập tên';
  if (!email?.trim())      errors.email      = 'Vui lòng nhập email';
  else if (!validateEmail(email)) errors.email = 'Email không hợp lệ';
  if (!phone?.trim())      errors.phone      = 'Vui lòng nhập số điện thoại';
  else if (!validatePhone(phone)) errors.phone = 'Số điện thoại không hợp lệ';
  if (!address?.trim())    errors.address    = 'Vui lòng nhập địa chỉ';
  return errors;
};
