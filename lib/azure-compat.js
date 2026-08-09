const { TableClient, TableServiceClient } = require('@azure/data-tables');
const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs');

function connString(account, key){
  return `DefaultEndpointsProtocol=https;AccountName=${account};AccountKey=${key};EndpointSuffix=core.windows.net`;
}

const TableQuery = {
  select: function(){
    const q = { tableName: null, filter: null };
    q.from = function(table){ this.tableName = table; return this; };
    q.where = function(clause, param){
      let value = param;
      if (typeof param === 'string'){
        value = `'${param.replace(/'/g, "\\'")}'`;
      }
      this.filter = clause.replace('?', value);
      return this;
    };
    return q;
  }
};

function createTableService(account, key){
  const cs = connString(account, key);
  return {
    createTableIfNotExists: async (tableName, cb)=>{
      try{
        const client = TableClient.fromConnectionString(cs, tableName);
        await client.createTable();
        cb && cb(null);
      }catch(e){
        if (e.statusCode === 409) cb && cb(null);
        else cb && cb(e);
      }
    },
    queryEntities: async (query, cb)=>{
      try{
        const tableName = query.tableName || query.table || query._table;
        const filter = query.filter || query._filter || undefined;
        const client = TableClient.fromConnectionString(cs, tableName);
        const rows = [];
        for await (const entity of client.listEntities({ queryOptions: { filter } })){
          rows.push(entity);
        }
        cb && cb(null, rows);
      }catch(e){ cb && cb(e); }
    },
    queryEntity: async (tableName, partitionKey, rowKey, cb)=>{
      try{
        const client = TableClient.fromConnectionString(cs, tableName);
        const res = await client.getEntity(partitionKey, rowKey);
        cb && cb(null, res);
      }catch(e){ cb && cb(e); }
    },
    insertEntity: async (tableName, item, cb)=>{
      try{
        const client = TableClient.fromConnectionString(cs, tableName);
        await client.createEntity(item);
        cb && cb(null);
      }catch(e){ cb && cb(e); }
    },
    updateEntity: async (tableName, entity, cb)=>{
      try{
        const client = TableClient.fromConnectionString(cs, tableName);
        await client.updateEntity(entity, 'Replace');
        cb && cb(null);
      }catch(e){ cb && cb(e); }
    }
  };
}

function createBlobService(account, key){
  const cs = connString(account, key);
  const serviceClient = BlobServiceClient.fromConnectionString(cs);
  return {
    createContainerIfNotExists: async (containerName, options, cb)=>{
      try{
        const containerClient = serviceClient.getContainerClient(containerName);
        await containerClient.createIfNotExists();
        cb && cb(null);
      }catch(e){ cb && cb(e); }
    },
    createBlockBlobFromFile: async (containerName, blobName, filePath, cb)=>{
      try{
        const containerClient = serviceClient.getContainerClient(containerName);
        await containerClient.createIfNotExists();
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.uploadFile(filePath);
        cb && cb(null, { container: containerName, blob: blobName });
      }catch(e){ cb && cb(e); }
    },
    getBlobUrl: function(containerName, blobName){
      const containerClient = serviceClient.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      return { url: ()=> blockBlobClient.url };
    }
  };
}

module.exports = {
  createTableService,
  createBlobService,
  TableQuery
};
