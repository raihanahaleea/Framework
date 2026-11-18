// src/presensi/helpers/geolocation.helper.ts
/**
 * Helper class that implements the Haversine formula
 * to calculate distance (in meters) between two geographic points.
 */
export class GeolocationHelper {
  private static toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Returns geodesic distance in meters between (lat1, lon1) and (lat2, lon2).
   * @param lat1 Latitude of point 1 (decimal degrees)
   * @param lon1 Longitude of point 1 (decimal degrees)
   * @param lat2 Latitude of point 2 (decimal degrees)
   * @param lon2 Longitude of point 2 (decimal degrees)
   */
  static distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
      throw new Error(`Invalid coordinates for Haversine calculation: (${lat1}, ${lon1}), (${lat2}, ${lon2})`);
    }

    const R = 6371000; // Mean Earth radius in meters
    const phi1 = this.toRadians(lat1);
    const phi2 = this.toRadians(lat2);
    const deltaPhi = this.toRadians(lat2 - lat1);
    const deltaLambda = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

