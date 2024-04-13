const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const app = express()
app.use(express.json())
const dbpath = path.join(__dirname, 'moviesData.db')
let db = null
const initializedbAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000)
  } catch (e) {
    console.log(`${e.message}`)
  }
}
initializedbAndServer()
const converttocamel = eachMovie => {
  return {
    movieName: eachMovie.movie_name,
  }
}

app.get('/movies/', async (request, response) => {
  const movieQuery = `
     SELECT *
     FROM 
     movie
     `
  const movieNameQuery = await db.all(movieQuery)
  response.send(movieNameQuery.map(each => converttocamel(each)))
})

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const movieQuery = `
  INSERT INTO 
  movie (director_id,movie_name,lead_actor)
  VALUES (${directorId},'${movieName}','${leadActor}')`
  const dbresponse = await db.run(movieQuery)
  response.send('Movie Successfully Added')
})

const convertToDb = eachMovie => {
  return {
    movieId: eachMovie.movie_id,
    directorId: eachMovie.director_id,
    movieName: eachMovie.movie_name,
    leadActor: eachMovie.lead_actor,
  }
}
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movieQuery = `
  SELECT *
  FROM
  movie
  WHERE 
  movie_id=${movieId}`
  const dbresponse = await db.get(movieQuery)
  response.send(convertToDb(dbresponse))
})

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = request.body
  const updateMovieQuery = `
  UPDATE 
  movie
  SET 
  director_id=${directorId},
  movie_name='${movieName}',
  lead_Actor='${leadActor}'
  WHERE 
  movie_id=${movieId};`
  const dbresponse = await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deletemovieQuery = `
  DELETE FROM 
    movie
  WHERE 
    movie_id=${movieId}`
  const dbresponse = await db.run(deletemovieQuery)
  response.send('Movie Removed')
})
const convertTheDirector = eachDirector => {
  return {
    directorId: eachDirector.director_id,
    directorName: eachDirector.director_name,
  }
}
app.get('/directors/', async (request, response) => {
  const directorQuery = `
     SELECT *
     FROM 
      director
     `
  const directorNameQuery = await db.all(directorQuery)
  response.send(directorNameQuery.map(each => convertTheDirector(each)))
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getdirectorMovieNames = `
  SELECT *
  FROM 
  movie
  WHERE 
  director_id=${directorId}`
  const dbresponse = await db.all(getdirectorMovieNames)
  response.send(dbresponse.map(each => ({movieName: each.movie_name})))
})
module.exports = app
