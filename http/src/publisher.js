import { unmarshall } from '@aws-sdk/util-dynamodb';
import { PutEventsCommand } from '@aws-sdk/client-eventbridge';
import Logger from '@dazn/lambda-powertools-logger';

import getEventBridgeClient from './eventBridgeClient';

class Publisher {
  constructor(busName) {
    this.busName = busName;
  }

  async publish({ dynamoDbStreamEvent, sourceName }) {
    try {
      const insertEntries = this.#convertInsertEntriesToEvents({ dynamoDbStreamEvent, sourceName });
      const modifyEntries = this.#convertModifyEntriesToEvents({ dynamoDbStreamEvent, sourceName });
      const removeEntries = this.#convertRemoveEntriesToEvents({ dynamoDbStreamEvent, sourceName });
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

  #convertModifyEntriesToEvents({ dynamoDbStreamEvent, sourceName }) {
    const eventBridgeEvents = [];
    dynamoDbStreamEvent.Records.filter((record) => record.eventName === 'MODIFY').forEach(
      (record) => {
        const newImage = unmarshall(record.dynamodb.NewImage);
        const oldImage = unmarshall(record.dynamodb.OldImage);
        const event = {
          Detail: JSON.stringify({ old: oldImage, new: newImage }),
          Source: sourceName,
          DetailType: EventDetailTypes.UPDATE,
          EventBusName: this.busName,
        };
        eventBridgeEvents.push(event);
      },
    );

    return eventBridgeEvents;
  }

  #convertInsertEntriesToEvents({ dynamoDbStreamEvent, sourceName }) {
    const eventBridgeEvents = [];
    dynamoDbStreamEvent.Records.filter((record) => record.eventName === 'INSERT').forEach(
      (record) => {
        const newImage = unmarshall(record.dynamodb.NewImage);
        const event = {
          Detail: JSON.stringify(newImage),
          Source: sourceName,
          DetailType: EventDetailTypes.CREATE,
          EventBusName: this.busName,
        };
        eventBridgeEvents.push(event);
      },
    );

    return eventBridgeEvents;
  }

  #convertRemoveEntriesToEvents({ dynamoDbStreamEvent, sourceName }) {
    const eventBridgeEvents = [];
    dynamoDbStreamEvent.Records.filter((record) => record.eventName === 'REMOVE').forEach(
      (record) => {
        const newImage = unmarshall(record.dynamodb.OldImage);
        const event = {
          Detail: JSON.stringify(newImage),
          Source: sourceName,
          DetailType: EventDetailTypes.DELETE,
          EventBusName: this.busName,
        };
        eventBridgeEvents.push(event);
      },
    );

    return eventBridgeEvents;
  }
}

const EventDetailTypes = {
  CREATE: 'create',
  DELETE: 'delete',
  UPDATE: 'update',
};

export default Publisher;
