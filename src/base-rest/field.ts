/**
 * Warning! Don't use this file. This is proposition for feature versions.
 */
import { AnyObject } from 'app/helpers/typed-object';

/**
 * Example 2: custom field (making bit mask)
 *
 *     // local -> remote
 *     {
 *       access: {
 *                 parser: (raw) => (raw['can_write'] ? User.CAN_WRITE : 0 )
 *                                | (raw['can_read']  ? User.CAN_READ  : 0 ),
 *                 formatter: (model, raw) => {
 *                   raw['can_write'] = model.access & User.CAN_WRITE ? true : false;
 *                   raw['can_read']  = model.access & User.CAN_READ  ? true : false;
 *                 }
 *               },
 *     }
 *
 *     // remote -> local
 *     {
 *       can_write: {
 *                    parser: (model, raw) => {
 *                              model.access = (raw['can_write'] ? User.CAN_WRITE : 0 )
 *                                           | (raw['can_read']  ? User.CAN_READ  : 0 );
 *                            },
 *                    formatter: (model) => model.access & User.CAN_WRITE ? 1 : 0,
 *                  },
 *       can_read: { formatter: (model) => model.access & User.CAN_READ ? 1 : 0 }
 *     }
 *
 * If `parser` is not set - model property will not be filled.
 * If `formatter` is not set - model property will not be reflected on request body
 *
 */

interface CustomField<M> {
  parser?: (raw: AnyObject) => any;
  formatter?: (model: M, raw: AnyObject) => void;
}

export type Field<M> = string | CustomField<M>;

/**
 * @see {@link BaseRestService#fieldsMap}
 */
export type FieldsMap<M> = { [name: string]: Field<M> };
