export const getSubjects = (board: string, classLevel: string, medium: string): string[] => {
  const isHighSchool = parseInt(classLevel) > 10;
  if (medium.includes("Hindi")) return isHighSchool ? ["Bhautik Vigyan (Physics)", "Rasayan Vigyan (Chemistry)", "Ganit (Maths)", "Jeev Vigyan (Biology)", "Hindi", "Angrezi (English)"] : ["Ganit (Maths)", "Vigyan (Science)", "Samajik Vigyan (SST)", "Hindi", "Angrezi (English)"];
  if (medium.includes("Gujarati")) return isHighSchool ? ["Physics", "Chemistry", "Maths", "Biology", "Gujarati", "English"] : ["Maths", "Science", "Social Science", "Gujarati", "English"];
  if (medium.includes("Marathi")) return isHighSchool ? ["Physics", "Chemistry", "Maths", "Biology", "Marathi", "English"] : ["Maths", "Science", "Social Science", "Marathi", "English"];
  if (medium.includes("Bengali")) return isHighSchool ? ["Physics", "Chemistry", "Maths", "Biology", "Bengali", "English"] : ["Maths", "Science", "Social Science", "Bengali", "English"];
  if (medium.includes("Tamil")) return isHighSchool ? ["Physics", "Chemistry", "Maths", "Biology", "Tamil", "English"] : ["Maths", "Science", "Social Science", "Tamil", "English"];
  
  if (isHighSchool) {
    return ["Physics", "Chemistry", "Mathematics", "Biology", "Computer Science", "English", "Accountancy", "Business Studies", "Economics"];
  }
  return ["Mathematics", "Science", "Social Science", "English", "Hindi", "Computer Science"];
};
