import { unmarshall } from '@aws-sdk/util-dynamodb';
import { PutEventsCommand } from '@aws-sdk/client-eventbridge';
import Logger from '@dazn/lambda-powertools-logger';
import { ulid } from 'ulid';

import getEventBridgeClient from './eventBridgeClient';

class Publisher {
  constructor(busName) {
    this.busName = busName;
  }

  async publish({ domain, dynamoDbStreamEvent, service, source }) {
    try {
      const insertEntries = this.#convertInsertEntriesToEvents({
        domain,
        dynamoDbStreamEvent,
        service,
        source,
      });
      const modifyEntries = this.#convertModifyEntriesToEvents({
        domain,
        dynamoDbStreamEvent,
        service,
        source,
      });
      const removeEntries = this.#convertRemoveEntriesToEvents({
        domain,
        dynamoDbStreamEvent,
        service,
        source,
      });
      const allEntries = [...insertEntries, ...modifyEntries, ...removeEntries];
      if (allEntries.length === 0) {
        Logger.info('No events to publish');
        return;
      }
      const eventBridgeClient = getEventBridgeClient();
      const putEventsCommand = new PutEventsCommand({ Entries: allEntries });
      await eventBridgeClient.send(putEventsCommand);
    } catch (error) {
      Logger.error('Failed to publish events', { error });
      throw error;
    }
  }

  #convertModifyEntriesToEvents({ domain, dynamoDbStreamEvent, service, source }) {
    const eventBridgeEvents = [];
    dynamoDbStreamEvent.Records.filter((record) => record.eventName === 'MODIFY').forEach(
      (record) => {
        const newImage = unmarshall(record.dynamodb.NewImage);
        const oldImage = unmarshall(record.dynamodb.OldImage);
        const detailType = getUpdateDetailType(source);
        const metadata = getMetadata({ domain, service, detailType });
        const event = {
          Detail: JSON.stringify({ data: { old: oldImage, new: newImage }, metadata }),
          Source: source,
          DetailType: detailType,
          EventBusName: this.busName,
        };
        eventBridgeEvents.push(event);
      },
    );

    return eventBridgeEvents;
  }

  #convertInsertEntriesToEvents({ domain, dynamoDbStreamEvent, service, source }) {
    const eventBridgeEvents = [];
    dynamoDbStreamEvent.Records.filter((record) => record.eventName === 'INSERT').forEach(
      (record) => {
        const newImage = unmarshall(record.dynamodb.NewImage);
        const detailType = getCreateDetailType(source);
        const metadata = getMetadata({ domain, service, detailType });
        const event = {
          Detail: JSON.stringify({ data: newImage, metadata }),
          Source: source,
          DetailType: EventDetailTypes.CREATE,
          EventBusName: this.busName,
        };
        eventBridgeEvents.push(event);
      },
    );

    return eventBridgeEvents;
  }

  #convertRemoveEntriesToEvents({ domain, dynamoDbStreamEvent, service, source }) {
    const eventBridgeEvents = [];
    dynamoDbStreamEvent.Records.filter((record) => record.eventName === 'REMOVE').forEach(
      (record) => {
        const oldImage = unmarshall(record.dynamodb.OldImage);
        const detailType = getDeleteDetailType(source);
        const metadata = getMetadata({ domain, service, detailType });
        const event = {
          Detail: JSON.stringify({ data: oldImage, metadata }),
          Source: source,
          DetailType: EventDetailTypes.DELETE,
          EventBusName: this.busName,
        };
        eventBridgeEvents.push(event);
      },
    );

    return eventBridgeEvents;
  }
}

const getUpdateDetailType = (source) => `${source}.${EventDetailTypes.UPDATE}`;
const getCreateDetailType = (source) => `${source}.${EventDetailTypes.CREATE}`;
const getDeleteDetailType = (source) => `${source}.${EventDetailTypes.DELETE}`;
const getMetadata = ({ domain, service, detailType }) => {
  const metadata = {
    id: ulid(),
    version: '1',
    timestamp: new Date().toISOString(),
    domain,
    service,
    type: detailType,
  };

  return metadata;
};
const EventDetailTypes = {
  CREATE: 'create',
  DELETE: 'delete',
  UPDATE: 'update',
};

export default Publisher;
