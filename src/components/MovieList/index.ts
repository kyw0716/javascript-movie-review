import { Movies } from "../../domain/Movies";
import { Movie } from "../../types";
import { fetchPopularMovies, fetchSearchMovies } from "../../utils/api";
import starImg from "../../../templates/star_filled.png";
import { $ } from "../../utils/selector";

type showType = "popular" | "search";

interface State {
  show: showType;
  searchKeyword: string;
  page: number;
}

export class MovieList {
  #$target;

  #state: State = {
    show: "popular",
    searchKeyword: "",
    page: 1,
  };

  #movies: Movies = new Movies([]);

  constructor($target: Element) {
    this.#$target = $target;

    fetchPopularMovies(this.#state.page).then((response) => {
      const { results } = response;
      this.#movies.reset(results);
      this.init();
    });

    $(".btn")?.addEventListener("click", this.onClickMoreButton.bind(this));
  }

  init() {
    this.#$target.innerHTML = `
      ${this.#movies
        .getList()
        .map((movie) => this.getMovieCardTemplate(movie))
        .join("")}
    `;
  }

  getMovieCardTemplate(movie: Movie) {
    return (
      /*html*/
      `
      <li>
        <a href="#">
          <div class="item-card">
            <img
              class="item-thumbnail"
              src="https://image.tmdb.org/t/p/w220_and_h330_face/${movie.poster_path}"
              loading="lazy"
              alt="${movie.title}"
            />
            <p class="item-title">${movie.title}</p>
            <p class="item-score"><img src="${starImg}" alt="별점" />${movie.vote_average}</p>
          </div>
        </a>
      </li>
    `
    );
  }

  render(movieList: Movie[]) {
    this.#$target.innerHTML += `
        ${movieList.map((movie) => this.getMovieCardTemplate(movie)).join("")}
    `;
    this.#movies.add(movieList);
  }

  reset(state: "popular" | "search", searchKeyword?: string) {
    this.#state.page = 1;
    this.#state = { ...this.#state, show: state };

    if (state === "popular") {
      fetchPopularMovies(this.#state.page).then((response: Movie[]) => {
        this.#movies.reset(response);
        this.init();
      });

      return;
    }

    if (searchKeyword) {
      this.#state = { ...this.#state, searchKeyword: searchKeyword };

      fetchSearchMovies(this.#state.page, this.#state.searchKeyword).then(
        (response: Movie[]) => {
          this.#movies.reset(response);
          this.init();
        }
      );
    }

    this.init();
  }

  onClickMoreButton() {
    this.#state.page += 1;

    if (this.#state.show === "popular")
      fetchPopularMovies(this.#state.page).then((response) => {
        const { results } = response;
        this.render(results);
      });

    if (this.#state.show === "search")
      fetchSearchMovies(this.#state.page, this.#state.searchKeyword).then(
        (response) => {
          const { results } = response;
          this.render(results);
        }
      );
  }
}
