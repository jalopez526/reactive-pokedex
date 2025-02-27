import React, { useEffect, useState, useCallback } from "react";
import { ApiResponse } from "../../types";
import { Pokemon } from "../Pokemon";
import { Loader } from '../Loader'

import './Pokemons.css';

export interface ISprites {
  back_default: string;
  back_female?: any;
  back_shiny: string;
  back_shiny_female?: any;
  front_default: string;
  front_female?: any;
  front_shiny: string;
  front_shiny_female?: any;
  other: IOther;
}

export interface IOfficialArtwork {
  front_default: string;
}

export interface IOther {
  "official-artwork": IOfficialArtwork;
}

export interface IPokemon {
  id: number;
  name: string;
  sprites: ISprites;
}

export interface PokemonList {
  name: string;
  url: string;
}

const Pokemons = () => {
  const [pokemons, setPokemons] = useState<IPokemon[]>([]);
  const [offset, setOffset] = useState<number>(0);
  const [limit, setLimit] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadMorePokemons = (event: Event) => {
      const window = event.currentTarget as Window;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (Math.ceil(window.scrollY) === scrollable) {
        setOffset((prevOffset: number) => {
          return prevOffset + 20;
        })
        //document.documentElement.scrollTo(0, scrollable - 10);
      }
    }

    const getInitialPokemonList = async (limit?: number, offset?: number) => {
      setLoading(true);
      const url = `https://pokeapi.co/api/v2/pokemon/?limit=${limit}&offset=${offset}`;
      const pokemonsList = await fetch(url).then((res) => res.json()).then((data: ApiResponse<PokemonList>) => data.results);

      return pokemonsList;
    }

    const getFullPokemonInfo = async (limit: number, offset: number) => {
      const halfwayPokemons = await getInitialPokemonList(limit, offset);
      const promises = halfwayPokemons.map(pmkn => fetch(pmkn.url).then(res => res.json()));
      const pokemonsToDisplay = await Promise.all(promises);

      setPokemons((prevPokemons) => [...prevPokemons, ...pokemonsToDisplay]);
      setLoading(false);
    }

    try {
      getFullPokemonInfo(limit, offset);
    } catch (error) {
      setLoading(false);
    }

    window.addEventListener('scroll', loadMorePokemons);
    return () => {
      window.removeEventListener("scroll", loadMorePokemons);
    };
  }, [offset]);

  return (
    <div className="container">
      <Loader showLoader={loading} />
      {pokemons.map((pokemon) => {
        return <Pokemon key={pokemon.id} pokemon={pokemon} />
      })}
    </div>
  );
};

export default Pokemons;
