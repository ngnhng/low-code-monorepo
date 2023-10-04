import { Data } from "../types/Config";
import { addToZoneCache } from "./reducer";

/**
 * Flush out all zones and let them re-register using the zone cache
 *
 * @param data initial data
 * @returns data with zones removed
 */
export const flushZones = (data: Data): Data => {
  const { zones } = data;
  console.log("Before flush", zones)

  if (zones) {
    Object.keys(zones).forEach((zone) => {
      addToZoneCache(zone, zones[zone]);
    });

	console.log("After flush", zones)

    return {
      ...data,
      zones: {},
    };
  }

  console.log("After flush", zones)

  return data;
};
