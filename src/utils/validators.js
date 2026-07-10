// Validate email
export const isValidEmail = (email) => {
  if (!email) return true; // Email is optional
  const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return regex.test(email);
};

// Validate username (min 3 chars, letters, numbers, underscore)
export const isValidUsername = (username) => {
  if (!username) return false;
  const regex = /^[a-zA-Z0-9_]{3,20}$/;
  return regex.test(username);
};

// Validate password (min 6 chars)
export const isValidPassword = (password) => {
  if (!password) return false;
  return password.length >= 6;
};

// Validate full name (min 2 chars)
export const isValidFullName = (name) => {
  if (!name) return false;
  return name.trim().length >= 2;
};

// Validate time format (HH:MM)
export const isValidTime = (time) => {
  if (!time) return false;
  const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(time);
};

// Validate date (not in past)
export const isValidDate = (date) => {
  if (!date) return false;
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selectedDate >= today;
};

// Validate number of guests
export const isValidGuests = (guests, maxCapacity) => {
  const num = Number(guests);
  if (isNaN(num)) return false;
  if (num < 1) return false; // FIXED: Minimum 1 guest
  if (maxCapacity && num > maxCapacity) return false;
  return true;
};

// Validate room capacity
export const isValidCapacity = (capacity) => {
  const num = Number(capacity);
  if (isNaN(num)) return false;
  return num >= 1 && num <= 100;
};

// Validate building number
export const isValidBuilding = (building) => {
  if (!building) return false;
  return building.trim().length >= 1;
};

// Validate floor number
export const isValidFloor = (floor) => {
  if (!floor) return false;
  return floor.trim().length >= 1;
};

// Validate department
export const isValidDepartment = (department) => {
  const departments = [
    'Director Office',
    'Deputy Director Office',
    'Business Statistics',
    'Household Statistics',
    'Other Departments',
  ];
  return departments.includes(department);
};

// Validate room name
export const isValidRoomName = (name) => {
  if (!name) return false;
  return name.trim().length >= 2 && name.trim().length <= 50;
};

// Validate meeting title
export const isValidMeetingTitle = (title) => {
  if (!title) return false;
  return title.trim().length >= 3 && title.trim().length <= 100;
};

// Validate phone number (optional)
export const isValidPhone = (phone) => {
  if (!phone) return true;
  const regex = /^[0-9]{10}$/;
  return regex.test(phone.replace(/\D/g, ''));
};

// Validate time range (start < end)
export const isValidTimeRange = (startTime, endTime) => {
  if (!startTime || !endTime) return false;
  return startTime < endTime;
};

// FIXED: Check if time is within business hours (REMOVED - meetings can be any time)
// export const isBusinessHours = (time) => {
//   if (!time) return false;
//   const hours = parseInt(time.split(':')[0]);
//   return hours >= 8 && hours < 20;
// };

// FIXED: Validate meeting duration (minimum 15 minutes, no maximum)
export const isValidMeetingDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return false;
  
  const startParts = startTime.split(':').map(Number);
  const endParts = endTime.split(':').map(Number);
  const startMinutes = startParts[0] * 60 + startParts[1];
  const endMinutes = endParts[0] * 60 + endParts[1];
  const duration = endMinutes - startMinutes;
  
  // Minimum 15 minutes
  if (duration < 15) return false;
  
  // No maximum limit - removed 8 hour restriction
  return true;
};

// FIXED: Check if meeting starts at least 5 minutes from now for today's bookings
export const isValidMeetingStartTime = (startTime, meetingDate) => {
  if (!startTime || !meetingDate) return true;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDate = new Date(meetingDate);
  selectedDate.setHours(0, 0, 0, 0);
  
  // Only validate if meeting is today
  if (selectedDate.getTime() !== today.getTime()) {
    return true;
  }
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;
  
  const startParts = startTime.split(':').map(Number);
  const startMinutes = startParts[0] * 60 + startParts[1];
  
  // Must be at least 5 minutes from now
  const bufferMinutes = currentTimeMinutes + 5;
  
  return startMinutes >= bufferMinutes;
};

// FIXED: Validate booking form (removed business hours restriction)
export const validateBooking = (data) => {
  const errors = {};

  if (!data.room) errors.room = 'Room is required';
  if (!data.meetingDate) errors.meetingDate = 'Meeting date is required';
  else if (!isValidDate(data.meetingDate)) errors.meetingDate = 'Date cannot be in the past';

  if (!data.startTime) errors.startTime = 'Start time is required';
  else if (!isValidTime(data.startTime)) errors.startTime = 'Invalid time format';
  // FIXED: Removed business hours check
  // FIXED: Added start time validation for today
  else if (!isValidMeetingStartTime(data.startTime, data.meetingDate)) {
    errors.startTime = 'Meeting must start at least 5 minutes from now';
  }

  if (!data.endTime) errors.endTime = 'End time is required';
  else if (!isValidTime(data.endTime)) errors.endTime = 'Invalid time format';
  // FIXED: Removed business hours check

  if (data.startTime && data.endTime) {
    if (!isValidTimeRange(data.startTime, data.endTime)) {
      errors.endTime = 'End time must be after start time';
    }
    // FIXED: Added duration validation
    else if (!isValidMeetingDuration(data.startTime, data.endTime)) {
      errors.endTime = 'Meeting must be at least 15 minutes long';
    }
  }

  if (!data.numberOfGuests) errors.numberOfGuests = 'Number of guests is required';
  else if (!isValidGuests(data.numberOfGuests, data.maxCapacity)) {
    errors.numberOfGuests = `Must be between 1 and ${data.maxCapacity || 100}`;
  }

  return errors;
};

// Validate user form
export const validateUser = (data) => {
  const errors = {};

  if (!data.fullName) errors.fullName = 'Full name is required';
  else if (!isValidFullName(data.fullName)) errors.fullName = 'Name must be at least 2 characters';

  if (!data.username) errors.username = 'Username is required';
  else if (!isValidUsername(data.username)) {
    errors.username = 'Username must be 3-20 characters (letters, numbers, underscore)';
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.email = 'Invalid email format';
  }

  if (!data.department) errors.department = 'Department is required';
  else if (!isValidDepartment(data.department)) errors.department = 'Invalid department';

  if (!data.password) errors.password = 'Password is required';
  else if (!isValidPassword(data.password)) errors.password = 'Password must be at least 6 characters';

  return errors;
};

// Validate room form
export const validateRoom = (data) => {
  const errors = {};

  if (!data.roomName) errors.roomName = 'Room name is required';
  else if (!isValidRoomName(data.roomName)) errors.roomName = 'Room name must be 2-50 characters';

  if (!data.buildingNumber) errors.buildingNumber = 'Building number is required';
  else if (!isValidBuilding(data.buildingNumber)) errors.buildingNumber = 'Invalid building number';

  if (!data.floorNumber) errors.floorNumber = 'Floor number is required';
  else if (!isValidFloor(data.floorNumber)) errors.floorNumber = 'Invalid floor number';

  if (!data.department) errors.department = 'Department is required';
  else if (!isValidDepartment(data.department)) errors.department = 'Invalid department';

  if (!data.maxCapacity) errors.maxCapacity = 'Maximum capacity is required';
  else if (!isValidCapacity(data.maxCapacity)) errors.maxCapacity = 'Capacity must be between 1 and 100';

  return errors;
};