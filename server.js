const express = require('express');
const {graphqlHTTP} = require('express-graphql');
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull
} = require('graphql')
const app = express();

const authors = [
  { id: 1, name: 'J. K. Rowling' },
  { id: 2, name: 'J. R. R. Tolkien' },
  { id: 3, name: 'Brent Weeks' }
]

const books = [
  { id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
  { id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
  { id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
  { id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
  { id: 5, name: 'The Two Towers', authorId: 2 },
  { id: 6, name: 'The Return of the King', authorId: 2 },
  { id: 7, name: 'The Way of Shadows', authorId: 3 },
  { id: 8, name: 'Beyond the Shadows', authorId: 3 }
]

// const schema = new GraphQLSchema({
//   query: new GraphQLObjectType({
//     name:'Helloworld',
//     fields: () =>({
//       message: {
//         type: GraphQLString,
//         resolve:()=>('Hello world')
//       }
//     })
//   })
// })

const Authortype = new GraphQLObjectType({
  name:'Author',
  description:'This represents an author',
  fields:()=>({
    id:{
      type: new GraphQLNonNull(GraphQLInt),
    },
    name:{
      type: new GraphQLNonNull(GraphQLString),
    },
    books:{
      type: new GraphQLList(Booktype),
      resolve: (author) => {
        return books.filter(book => author.id === book.authorId)
      }
    }
  })
})

const Booktype = new GraphQLObjectType({
  name:'Book',
  description:'This represents a book written by an author',
  fields:()=>({
    id:{
      type: new GraphQLNonNull(GraphQLInt),
    },
    name:{
      type: new GraphQLNonNull(GraphQLString),
    },
    authorId:{
      type: new GraphQLNonNull(GraphQLInt),
    },
    author:{
      type: Authortype,
      resolve:(book)=> {
        return  authors.find(author => author.id === book.authorId)}
    }
  })
})

const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  description: "Root Query",
  fields:()=>({
    book:{
      type: Booktype,
      description: ' a book',
      args:{
        id: {type: GraphQLInt}
      },
      resolve:(parents,args)=> books.find(book => book.id === args.id)
    },
    books:{
      type: new GraphQLList(Booktype),
      description: 'list of books',
      resolve:()=> books
    },
    authors:{
      type: new GraphQLList(Authortype),
      description: 'list of authors',
      resolve:()=> authors
    },
    author:{
      type: Authortype,
      description: 'An authors',
      args:{
        id: {type: GraphQLInt}
      },
      resolve:(parents,args)=> authors.find(author => author.id === args.id)
    }
  })

})

const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Root Mutation',
  fields: () => ({
    addBook: {
      type: Booktype,
      description: 'Add a book',
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (parent, args) => {
        const book = { id: books.length + 1, name: args.name, authorId: args.authorId }
        books.push(book)
        return book
      }
    },
    addAuthor: {
      type: Authortype,
      description: 'Add an author',
      args: {
        name: { type: GraphQLNonNull(GraphQLString) }
      },
      resolve: (parent, args) => {
        const author = { id: authors.length + 1, name: args.name }
        authors.push(author)
        return author
      }
    }
  })
})

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType
})
app.use('/graphql',
  graphqlHTTP({
    schema: schema,
    graphiql: true
  }),
);
app.listen(5000,()=>console.log('Server Running'))
