import ApolloClient from 'apollo-boost';
import gql from 'graphql-tag'
import React from 'react'
import { Container, Typography, Box } from '@material-ui/core';

export default function App({ authState }) {
  const isIn = authState.status === 'in'
  const headers = isIn ? { Authorization: `Bearer ${authState.validToken}` } : {}

  const client = new ApolloClient({
    uri: 'https://test-intrinsic.herokuapp.com/v1/graphql',
    headers
  })


  client.query({
    query: gql`
    {
      programming_language(order_by: { vote_count: desc }) {
        name
        vote_count
      }
    }
    `
  }).then(result => console.log(result));


  return (
    <Container>
      <h2>Data:{}</h2>
    </Container>
  )
}