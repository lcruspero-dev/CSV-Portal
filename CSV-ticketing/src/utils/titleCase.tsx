const TitleCase = (name = "") => 

    name.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());

export default TitleCase;