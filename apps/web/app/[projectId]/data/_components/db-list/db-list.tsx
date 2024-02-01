import React from 'react'
import DBCard from './db-card'

type DB = {
  name: string;
  img: string;
}

export const DBListInstance: DB[] = [
  {
    name: 'BigQuery',
    img: '/db-icon/big-query.svg',
  },
  {
    name: 'PostgreSQL',
    img: '/db-icon/postgre.svg',
  },
  {
    name: 'MongoDB',
    img: '/db-icon/mongodb.svg',
  },
  {
    name: 'Redis',
    img: '/db-icon/redis.svg',
  },
  {
    name: 'MySQL',
    img: '/db-icon/mysql.svg',
  },
  {
    name: 'CouchDB',
    img: '/db-icon/couchdb.svg',
  },
  {
    name: 'Sheet',
    img: '/db-icon/gg-sheet.svg',
  },
  {
    name: 'Slack',
    img: '/db-icon/slack.svg',
  },
  {
    name: 'RestAPI',
    img: '/db-icon/rest-api.svg',
  },
] 

const DBList = () => {
  return (
    <div className='grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4'>
      {DBListInstance.map(instance => (
        <DBCard key={instance.name} name={instance.name} img={instance.img}></DBCard>
      ))}
    </div>
  )
}

export default DBList