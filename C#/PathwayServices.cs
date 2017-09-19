using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data.SqlClient;
using System.Data;

namespace Services
{
    public class PathwayServices : IPathwayServices
    {
        readonly IDataProvider dataProvider;
      

        public PathwayServices(IDataProvider dataProvider)
        {
            this.dataProvider = dataProvider;
        }

        public void Deactivate(int PathwayId)
        {
            dataProvider.ExecuteNonQuery("dbo.Pathway_Deactivated"
                , inputParamMapper: delegate (SqlParameterCollection paramCollection)
               {
                   paramCollection.AddWithValue("@Id", PathwayId);
               });

            dataProvider.ExecuteNonQuery("dbo.PathwayItem_Deactivate"
               , inputParamMapper: delegate (SqlParameterCollection paramCollection)
               {
                   paramCollection.AddWithValue("@PathwayId", PathwayId);
               });
        }
        public int Insert(AddPathway model)
        {
            int Id = 0;

            dataProvider.ExecuteNonQuery("dbo.Pathway_Insert"
                , inputParamMapper: delegate (SqlParameterCollection paramCollection)
                {
                    paramCollection.AddWithValue("@Name", model.Name);
                    paramCollection.AddWithValue("@Description", model.Description);
                    paramCollection.AddWithValue("@CoverImage", model.CoverImage);
                    paramCollection.AddWithValue("@Topics", model.Topics);

                    SqlParameter idParameter = new SqlParameter("@Id", System.Data.SqlDbType.Int);
                    idParameter.Direction = System.Data.ParameterDirection.Output;

                    paramCollection.Add(idParameter);

                }, returnParameters: delegate (SqlParameterCollection param)
                {
                    Int32.TryParse(param["@Id"].Value.ToString(), out Id);
                }
                );
            return Id;
        }
        public int InsertContent(AddContentPW model)
        {
            int Id = 0;
            dataProvider.ExecuteNonQuery("dbo.PathwayItem_Insert"
                , inputParamMapper: delegate (SqlParameterCollection paramCollection)
                {
                    paramCollection.AddWithValue("@PathwayId", model.PathwayId);
                    paramCollection.AddWithValue("@ContentName", model.ContentName);
                    paramCollection.AddWithValue("@level", model.Level);
                    paramCollection.AddWithValue("@ContentItemId", model.ContentItemId);
                    paramCollection.AddWithValue("@UserId", model.UserId);
                    paramCollection.AddWithValue("@ContentTopics", model.ContentTopics);

                    SqlParameter idParameter = new SqlParameter("@Id", System.Data.SqlDbType.Int);
                    idParameter.Direction = System.Data.ParameterDirection.Output;

                    paramCollection.Add(idParameter);
                }, returnParameters: delegate (SqlParameterCollection param)
                {
                    Int32.TryParse(param["@Id"].Value.ToString(), out Id);
                }
                );
            return Id;
        }
        public List<Pathway> SearchPathway(string search)
        {
            List<Pathway> list = null;

            dataProvider.ExecuteCmd("dbo.Pathway_PathwaySearch"
               , inputParamMapper: delegate (SqlParameterCollection paramCollection)
               {
                   paramCollection.AddWithValue("@search", search);
               }
               , singleRecordMapper: delegate (IDataReader reader, short set)
               {
                   Pathway singleItem = new Pathway();
                   int startingIndex = 0;

                   singleItem.Id = reader.GetSafeInt32(startingIndex++);
                   singleItem.Name = reader.GetSafeString(startingIndex++);
                   singleItem.Description = reader.GetSafeString(startingIndex++);
                   singleItem.Topics = reader.GetSafeString(startingIndex++);

                   if (list == null)
                   {
                       list = new List<Pathway>();
                   }

                   list.Add(singleItem);
               }
               );

            return list;
        }

        public List<ContentItem> SelectAllContent()
        {
            List<ContentItem> list = null;

            dataProvider.ExecuteCmd("dbo.ContentItems_SelectAll"
                , inputParamMapper: null
                , singleRecordMapper: delegate (IDataReader reader, short set)
                {
                    ContentItem singleItem = new ContentItem();
                    int startingIndex = 0;

                    singleItem.Id = reader.GetSafeInt32(startingIndex++);
                    singleItem.Content = reader.GetSafeString(startingIndex++);
                    singleItem.ContentTitle = reader.GetSafeString(startingIndex++);
                    singleItem.ContentType = reader.GetSafeString(startingIndex++);
                    singleItem.UserId = reader.GetSafeInt32(startingIndex++);

                    if (list == null)
                    {
                        list = new List<ContentItem>();
                    }
                    list.Add(singleItem);
                }
                );
            return list;
        }

        public List<PathwayOnlyIdAndName> SelectOnlyIdAndName()
        {
            List<PathwayOnlyIdAndName> list = null;

            dataProvider.ExecuteCmd("dbo.Pathway_SelectOnlyIdAndName"
                , inputParamMapper: null
                , singleRecordMapper: delegate (IDataReader reader, short set)
                {
                    PathwayOnlyIdAndName singleItem = new PathwayOnlyIdAndName();
                    int startingIndex = 0;

                    singleItem.Id = reader.GetSafeInt32(startingIndex++);
                    singleItem.Name = reader.GetSafeString(startingIndex++);

                    if (list == null)
                    {
                        list = new List<PathwayOnlyIdAndName>();
                    }
                    list.Add(singleItem);
                }
                );
            return list;
        }

        public Pathway SelectPathwayById(int id)
        {
            Pathway singleItem = null;

            dataProvider.ExecuteCmd("dbo.Pathway_SelectById"
                , inputParamMapper: delegate (SqlParameterCollection paramCollection)
                {
                    paramCollection.AddWithValue("@Id", id);
                }
                , singleRecordMapper: delegate (IDataReader reader, short set)
                {
                    singleItem = new Pathway();
                    int startingIndex = 0;

                    singleItem.Id = reader.GetSafeInt32(startingIndex++);
                    singleItem.Name = reader.GetSafeString(startingIndex++);
                    singleItem.Description = reader.GetSafeString(startingIndex++);
                    singleItem.CoverImage = reader.GetSafeInt32(startingIndex++);
                    singleItem.Topics = reader.GetSafeString(startingIndex++);

                    if (singleItem == null)
                    {
                        singleItem = new Pathway();
                    }
                }
                );
            return singleItem;
        }

        public List<PathwayItem> GetContentById(int id)
        {
            List<PathwayItem> list = null; ;

            dataProvider.ExecuteCmd("dbo.PathwayItem_SelectById"
                , inputParamMapper: delegate (SqlParameterCollection paramCollection)
                {
                    paramCollection.AddWithValue("@PathwayId", id);
                }
                , singleRecordMapper: delegate (IDataReader reader, short set)
                {
                    PathwayItem singleItem = new PathwayItem();
                    int startingIndex = 0;

                    singleItem.Id = reader.GetSafeInt32(startingIndex++);
                    singleItem.PathwayId = reader.GetSafeInt32(startingIndex++);
                    singleItem.ContentName = reader.GetSafeString(startingIndex++);
                    singleItem.Level = reader.GetSafeInt32(startingIndex++);
                    singleItem.ContentItemId = reader.GetSafeInt32(startingIndex++);
                    singleItem.UserId = reader.GetSafeInt32(startingIndex++);
                    singleItem.ContentTopics = reader.GetSafeString(startingIndex++);

                    if (list == null)
                    {
                        list = new List<PathwayItem>();
                    }
                    list.Add(singleItem);
                }
                );
            return list;
        }
        public void UpdatePathway(UpdatePathway model)
        {
            dataProvider.ExecuteNonQuery("dbo.Pathway_Update"
                , inputParamMapper: delegate (SqlParameterCollection paramCollection)
                {
                    paramCollection.AddWithValue("@Name", model.Name);
                    paramCollection.AddWithValue("@Description", model.Description);
                    paramCollection.AddWithValue("@CoverImage", model.CoverImage);
                    paramCollection.AddWithValue("@Topics", model.Topics);
                    paramCollection.AddWithValue("@Id", model.Id);
                }
                );
        }
        public List<PathwayItem> UpdateContent(int PathwayId, AddContentArray model)
        {

            dataProvider.ExecuteNonQuery("dbo.PathwayItem_DeleteByPathwayId"
               , inputParamMapper: delegate (SqlParameterCollection paramCollection)
                {
                    paramCollection.AddWithValue("@PathwayId", PathwayId);
                }
                );

            List<PathwayItem> list = null;
            foreach (var models in model.ContentList)
            {
                dataProvider.ExecuteNonQuery("dbo.PathwayItem_Insert"
                    , inputParamMapper: delegate (SqlParameterCollection paramCollection)
                    {
        
                        paramCollection.AddWithValue("@PathwayId", models.PathwayId);
                        paramCollection.AddWithValue("@ContentName", models.ContentName);
                        paramCollection.AddWithValue("@level", models.Level);
                        paramCollection.AddWithValue("@ContentItemId", models.ContentItemId);
                        paramCollection.AddWithValue("@UserId", models.UserId);
                        paramCollection.AddWithValue("@ContentTopics", models.ContentTopics);

                        SqlParameter idParameter = new SqlParameter("@Id", System.Data.SqlDbType.Int);
                        idParameter.Direction = System.Data.ParameterDirection.Output;

                        paramCollection.Add(idParameter);
                    }
                );
            }
            return list;
        }
    }
}
