$(document).ready(function () {

	// Switch light/dark
	$(".switch").on('click', function () {
		if ($("body").hasClass("light")) {
			$("body").removeClass("light");
			$(".switch").removeClass("switched");
		}
		else {
			$("body").addClass("light");
			$(".switch").addClass("switched");
		}
	});

	// SUPER HERO API
	// https://superheroapi.com/api/access-token
	const SUPERHERO_TOKEN = "10223569763528853"
	const BASE_URL = `https://superheroapi.com/api.php/${SUPERHERO_TOKEN}`

	// HTML ELEMENTS
	const searchQuery = $("#search-query")
	const searchButton = $("#search-button")
	const randomHeroButton = $("#random-button")
	const errorElement = $("#errors")
	const heroInfo = $("#hero-info")
	const previewList = $(".hero-available-elements ul")
	const previewInfo = $("#preview-info")

	const resetView = () => {
		previewInfo.hide()
		heroInfo.hide()
		errorElement.html("")
		errorElement.hide()
	}

	const getRandomSuperHero = (id) => {
		const API_ADDRESS = `${BASE_URL}/${id}`;
		console.log("Fetching random hero", API_ADDRESS)

		resetView();

		fetch(API_ADDRESS)
			.then(response => response.json())
			.then(superHeroJson => {
				if (superHeroJson.error) throw JSON.stringify({ id, response: superHeroJson })
				if (heroIsBroken(superHeroJson)) {
					// Try new random hero if stats are broken
					getRandomSuperHero(randomHero())
					return
				}

				showHeroInfo(superHeroJson);
			})
			.catch(error => {
				console.error("Error calling API", API_ADDRESS, error);
				errorElement.html(`<p>Something went wrong:</p><p>${error}</p>`);
				errorElement.show()
			})
	}

	const getSearchSuperHero = () => {
		let name = searchQuery.val().trim();
		console.log("search", name);

		if (name.length < 3) {
			//alert("Please enter at least 3 letter!")
			errorElement.html("<b>Please enter at least 3 letter!</b>")
			errorElement.show()
			searchQuery.focus()
			return;
		}
		const API_ADDRESS = `${BASE_URL}/search/${name}`;

		resetView()

		fetch(API_ADDRESS)
			.then(response => response.json())
			.then(json => {
				const heroes = json.results;
				previewList.html("");

				heroes.forEach(hero => {
					console.log("SuperHero: ", hero)
					if (heroIsBroken(hero)) return // Skip heroes with broken stats

					const li = $(document.createElement("li"));
					li.addClass("hover-target")
					li.html(`<img src="${hero.image.url}" alt="Preview">`)
					previewList.append(li);

					li.on("click", () => {
						showHeroInfo(hero)
					})
				});

				previewInfo.show();
			})
			.catch(error => {
				console.error("Error calling API", API_ADDRESS, error);
				errorElement.html(`<p>Something went wrong:</p><p>${error}</p>`);
				errorElement.show()
			})
	}

	const randomHero = () => {
		const numberOfHeroes = 731
		let random = Math.floor(Math.random() * numberOfHeroes) + 1
		console.log("Random hero number", random)
		return random
	}

	const heroIsBroken = (hero) => {
		for (let [key, value] of Object.entries(hero.powerstats)) {
			if (value == null || value === "null") {
				console.log("Hero has broken stats", hero, key, value)
				return true
			}
		}
		return false
	}

	const showHeroInfo = (character) => {
		console.log("character", character)
		$(".hero-center-section .image-content .img-wrap").html(`<img src="${character.image.url}" alt="Super hero image">`)
		$(".hero-center-section .info h3").text(character.name)

		let biography = "";
		if (character.biography["first-appearance"]) biography += `FIRST APPEARENCE: ${character.biography["first-appearance"]}`
		// TODO: More bio stuff?
		if (biography) $(".hero-center-section .info .biography").text(biography)

		for (let [key, value] of Object.entries(character.powerstats)) {
			$(`.hero-center-section .text-content .${key} h3`).text(value)
		}

		heroInfo.show()
	}

	searchButton.on("click", () => getSearchSuperHero())
	searchQuery.on("keyup", (event) => { if (event.key === "Enter") getSearchSuperHero() })
	randomHeroButton.on("click", () => getRandomSuperHero(randomHero()))
	//randomHeroButton.on("click", () => getRandomSuperHero(921)) // broken URL
	//randomHeroButton.on("click", () => getRandomSuperHero(694)) // "null" stats
});