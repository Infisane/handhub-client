import { useEffect, useRef } from "react";
import { useGeolocated } from "react-geolocated";
import { set_geolocation } from "#/core/redux-store/slices/geolocation.slice";
import { useAppDispatch } from "./useStore.hook";

export const useUserLocation = () => {
	const dispatch = useAppDispatch();
	// Track whether we have ever received valid coords so transient watch-cycle
	// errors don't downgrade a "granted" status back to "loading".
	const hasCoords = useRef(false);

	const { coords, isGeolocationAvailable, positionError, getPosition } =
		useGeolocated({
			positionOptions: {
				enableHighAccuracy: false,
				maximumAge: 1000 * 60 * 5,
			},
			watchPosition: true,
			suppressLocationOnMount: false,
		});

	useEffect(() => {
		// Strict false: undefined means the hook hasn't resolved yet (SSR/hydration).
		if (isGeolocationAvailable === false) {
			dispatch(set_geolocation({ status: "unavailable" }));
			return;
		}
		if (coords) {
			hasCoords.current = true;
			dispatch(
				set_geolocation({
					latitude: coords.latitude,
					longitude: coords.longitude,
					accuracy: coords.accuracy,
					status: "granted",
				}),
			);
			return;
		}
		if (positionError) {
			if (positionError.code === positionError.PERMISSION_DENIED) {
				dispatch(set_geolocation({ status: "denied" }));
			} else if (!hasCoords.current) {
				// POSITION_UNAVAILABLE / TIMEOUT before we ever had a fix → keep loading.
				// After a successful fix, ignore transient errors; the store already
				// holds valid coordinates with status "granted".
				dispatch(set_geolocation({ status: "loading" }));
			}
			return;
		}
		if (!hasCoords.current) {
			dispatch(set_geolocation({ status: "loading" }));
		}
	}, [coords, isGeolocationAvailable, positionError, dispatch]);

	return { getPosition };
};
