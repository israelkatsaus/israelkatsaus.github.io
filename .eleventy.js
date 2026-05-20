module.exports = function(eleventyConfig) {
    
    // Suomalainen päivämääräsuodatin
    eleventyConfig.addFilter("dtf", function(dateObj) {
        return new Date(dateObj).toLocaleDateString('fi-FI', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    });

    // Suodatin uutismäärän rajoittamiseen (esim. näytä vain 1 uutinen)
    eleventyConfig.addFilter("limit", function(array, limit) {
        return array.slice(0, limit);
    });

    // Suodatin uutisten hyppäämiseen (esim. hyppää yli se ensimmäinen pääuutinen)
    eleventyConfig.addFilter("offset", function(array, offset) {
        return array.slice(offset);
    });

    // Kopioidaan kansiot suoraan valmiille sivustolle
    eleventyConfig.addPassthroughCopy("src/css");
    eleventyConfig.addPassthroughCopy("src/images");

    return {
        dir: {
            input: "src",
            output: "_site"
        }
    };
};